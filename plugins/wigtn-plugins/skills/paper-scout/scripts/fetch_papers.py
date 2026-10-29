#!/usr/bin/env python3
"""최근 arXiv 논문을 가져와 키워드 매칭 + HF Daily Papers 인기 신호를 붙여 JSON 하나로 낸다.

판단(우리와 관련 있는지)은 스킬(모델)이 한다. 이 스크립트는 수집과 중복 제거만 한다.
stdlib 만 쓴다. 한 소스가 실패해도 나머지는 계속하고 warnings 에 남긴다.
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

UA = "wigtn-paper-scout/0.1 (+https://github.com/wigtn/wigtn-plugins)"
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV_PAGE = 100
ABSTRACT_CAP = 800
SEEN_DEFAULT = "~/.config/wigtn/paper-scout/seen.json"
SEEN_KEEP_DAYS = 180


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code not in (429, 503):
            raise
        time.sleep(5)  # 한도 초과·일시 장애는 한 번만 재시도
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()


def arxiv_id(raw):
    m = re.search(r"arxiv\.org/abs/(.+?)(v\d+)?$", raw)
    return m.group(1) if m else raw


def build_query(cats, keywords):
    parts = []
    if cats:
        parts.append("(" + " OR ".join(f"cat:{c}" for c in cats) + ")")
    if keywords:
        parts.append("(" + " OR ".join(f'all:"{k}"' for k in keywords) + ")")
    return " AND ".join(parts) if parts else "all:*"


def fetch_arxiv(cats, keywords, cutoff, limit, warnings):
    """submittedDate 내림차순으로 cutoff 이전을 만날 때까지 페이지를 넘긴다.

    limit 에 먼저 닿아 기간 끝까지 못 간 경우 warnings 에 남긴다(조용히 잘리지 않게).
    """
    q = build_query(cats, keywords)
    papers, start, complete = [], 0, False
    while start < limit:
        params = urllib.parse.urlencode({
            "search_query": q, "sortBy": "submittedDate", "sortOrder": "descending",
            "start": start, "max_results": min(ARXIV_PAGE, limit - start),
        })
        try:
            root = ET.fromstring(get("https://export.arxiv.org/api/query?" + params))
        except Exception as e:
            warnings.append(f"arxiv 호출 실패(start={start}): {e}")
            break
        entries = root.findall(ATOM + "entry")
        if not entries:
            complete = True
            break
        done = False
        for e in entries:
            published = e.findtext(ATOM + "published", "")
            if published[:10] < cutoff.isoformat():
                done = True
                break
            papers.append({
                "id": arxiv_id(e.findtext(ATOM + "id", "")),
                "title": " ".join(e.findtext(ATOM + "title", "").split()),
                "abstract": " ".join(e.findtext(ATOM + "summary", "").split()),
                "published": published[:10],
            })
        if done or len(entries) < ARXIV_PAGE:
            complete = True
            break
        start += ARXIV_PAGE
        time.sleep(3)  # arXiv API 권장 간격
    if not complete and start >= limit:
        warnings.append(f"arXiv 수집이 --limit {limit}건에서 잘렸다: 기간 끝까지 못 갔으니 --limit 을 늘리거나 키워드를 좁혀라")
    return papers


def fetch_hf(days, today, warnings):
    """날짜별 Daily Papers. {arxiv_id: {hf_upvotes}}"""
    out = {}
    for i in range(days + 1):
        d = (today - dt.timedelta(days=i)).isoformat()
        try:
            rows = json.loads(get(f"https://huggingface.co/api/daily_papers?date={d}&limit=100"))
        except Exception as e:
            warnings.append(f"HF {d} 호출 실패: {e}")
            continue
        for r in rows:
            p = r.get("paper", {})
            if p.get("id"):
                out[p["id"]] = {"hf_upvotes": p.get("upvotes", 0)}
    return out


def keyword_hits(text, keywords):
    low = text.lower()
    return [k for k in keywords if k.lower() in low]


def load_seen(path, warnings):
    """{arxiv_id: 보여 준 날짜}. 파일이 없으면 빈 상태, 깨졌으면 .bak 으로 치우고 빈 상태."""
    try:
        with open(path, encoding="utf-8") as f:
            return dict(json.load(f).get("seen", {}))
    except FileNotFoundError:
        return {}
    except Exception as e:
        warnings.append(f"seen 파일을 읽지 못해 무시한다({e}); {path}.bak 으로 옮긴다")
        try:
            os.replace(path, path + ".bak")
        except OSError:
            pass
        return {}


def mark_seen(path, ids, today, warnings):
    seen = load_seen(path, warnings)
    for i in ids:
        seen[i] = today.isoformat()
    keep_from = (today - dt.timedelta(days=SEEN_KEEP_DAYS)).isoformat()
    seen = {i: d for i, d in seen.items() if d >= keep_from}
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump({"updated_at": today.isoformat(), "seen": seen}, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)  # 쓰다 끊겨도 기존 파일이 깨지지 않게
    return len(seen)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--cats", default="cs.CL,cs.AI,cs.DB,cs.IR,cs.LG")
    ap.add_argument("--keywords", default="", help="콤마 구분. 비우면 카테고리 전체")
    ap.add_argument("--limit", type=int, default=300, help="arXiv 최대 수집 건수")
    ap.add_argument("--top", type=int, default=40, help="출력 후보 상한")
    ap.add_argument("--no-hf", action="store_true")
    ap.add_argument("--seen-file", default=SEEN_DEFAULT, help="이미 보여 준 논문 기록")
    ap.add_argument("--no-seen", action="store_true", help="기록된 논문도 다시 포함")
    ap.add_argument("--mark", default="", help="콤마 구분 arXiv ID 를 '보여 줌'으로 기록하고 끝낸다")
    a = ap.parse_args()

    seen_path = os.path.expanduser(a.seen_file)
    today = dt.date.today()
    warnings = []

    if a.mark:
        ids = [i.strip() for i in a.mark.split(",") if i.strip()]
        total = mark_seen(seen_path, ids, today, warnings)
        json.dump({"marked": len(ids), "seen_total": total, "warnings": warnings}, sys.stdout, ensure_ascii=False)
        print()
        return

    cats = [c.strip() for c in a.cats.split(",") if c.strip()]
    kws = [k.strip() for k in a.keywords.split(",") if k.strip()]
    cutoff = today - dt.timedelta(days=a.days)

    papers = fetch_arxiv(cats, kws, cutoff, a.limit, warnings)
    already_seen = 0
    if not a.no_seen:
        seen = load_seen(seen_path, warnings)
        fresh = [p for p in papers if p["id"] not in seen]
        already_seen = len(papers) - len(fresh)
        papers = fresh
    hf = {} if a.no_hf else fetch_hf(a.days, today, warnings)

    # HF 는 arXiv 후보에 업보트만 붙인다. HF 에만 있는 논문은 키워드 적중이 0이라 노이즈가 커서 뺐다.
    for p in papers:
        p.update(hf.get(p["id"], {}))
        p["keyword_hits"] = keyword_hits(p["title"] + " " + p["abstract"], kws)  # 자르기 전 전체 초록으로 센다
        p["abstract"] = p["abstract"][:ABSTRACT_CAP]

    # 키워드 적중 수 → HF 업보트 → 최신 순. 최종 선별은 모델이 한다.
    papers.sort(key=lambda p: (len(p["keyword_hits"]), p.get("hf_upvotes", 0), p["published"]), reverse=True)
    total = len(papers)
    json.dump({
        "window": {"from": cutoff.isoformat(), "to": today.isoformat()},
        "query": {"cats": cats, "keywords": kws},
        "total_collected": total,
        "already_seen": already_seen,
        "returned": min(total, a.top),
        "warnings": warnings,
        "papers": papers[:a.top],
    }, sys.stdout, ensure_ascii=False)
    print()


if __name__ == "__main__":
    main()
