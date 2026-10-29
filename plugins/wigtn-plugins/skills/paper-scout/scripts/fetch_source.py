#!/usr/bin/env python3
"""arXiv 논문의 TeX 소스를 받아 읽을 수 있는 파일만 풀고 JSON 하나로 목록을 낸다.

사용: fetch_source.py <arxiv_id> <빈 출력 폴더>
소스는 외부 입력이다. 경로 이탈·링크·과대 용량을 거부하고, .tex/.bbl/.bib 와 그림(png/jpg/pdf)만 푼다(실행 파일은 풀지 않는다).
소스가 없거나(PDF 전용) 형식을 못 읽으면 error 로 끝낸다. 이 스크립트는 풀린 파일을 실행하지 않는다.
"""
import gzip
import io
import json
import os
import re
import sys
import tarfile
import urllib.request

UA = "wigtn-paper-scout/0.1 (+https://github.com/wigtn/wigtn-plugins)"
ID_RE = re.compile(r"^(\d{4}\.\d{4,5}|[a-z\-]+(\.[A-Z]{2})?/\d{7})(v\d+)?$")  # v숫자는 그 버전을 그대로 받는다
MAX_DOWNLOAD = 50 * 1024 * 1024
MAX_FILES = 2000
MAX_TOTAL = 100 * 1024 * 1024
MAX_SCAN = 128 * 1024 * 1024  # tar 를 파싱하며 해제하는 전체 바이트(헤더·건너뛰는 멤버 포함). 최악의 메모리는 이 값의 1.3배쯤
MAX_FILE = 5 * 1024 * 1024  # 복제된 anthology.bib 같은 큰 참고문헌은 읽을 일이 없다
TEXT_EXT = (".tex", ".bbl", ".bib")
FIGURE_EXT = (".png", ".jpg", ".jpeg", ".pdf")  # Read 로 볼 수 있는 그림. 풀기만 하고 실행하지 않는다
KEEP_EXT = TEXT_EXT + FIGURE_EXT


def out(obj):
    json.dump(obj, sys.stdout, ensure_ascii=False)
    print()


def download(arxiv_id):
    req = urllib.request.Request(f"https://arxiv.org/e-print/{arxiv_id}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read(MAX_DOWNLOAD + 1)
    if len(data) > MAX_DOWNLOAD:
        raise ValueError("소스가 50MB 를 넘는다")
    return data


def gunzip_capped(data, cap):
    """cap 바이트까지만 풀어 본다. 전체를 먼저 풀고 검사하면 압축 폭탄에 메모리가 먼저 바닥난다."""
    with gzip.GzipFile(fileobj=io.BytesIO(data)) as g:
        out = g.read(cap + 1)
    if len(out) > cap:
        raise ValueError(f"풀린 크기가 {cap // (1024 * 1024)}MB 를 넘는다")
    return out


def safe_name(name):
    n = os.path.normpath(name)
    return not (os.path.isabs(n) or n.startswith("..") or "\x00" in name)


class CappedReader(io.RawIOBase):
    """읽은 바이트 합계가 cap 을 넘으면 예외를 낸다.

    tarfile 은 멤버를 돌려주기 전에 PAX/GNU 확장 헤더 전체를 메모리에 읽는다. 헤더가 큰 크기를
    선언하면 멤버 단위 검사에 닿기도 전에 메모리가 차므로, 파싱 아래층(압축 해제 쪽)에서 막는다.
    """

    def __init__(self, raw, cap):
        self._raw, self._cap, self._n = raw, cap, 0

    def readable(self):
        return True

    def readinto(self, b):
        chunk = self._raw.read(len(b))
        self._n += len(chunk)
        if self._n > self._cap:
            raise ValueError(f"압축을 푼 전체 크기가 {self._cap // (1024 * 1024)}MB 를 넘는다")
        b[:len(chunk)] = chunk
        return len(chunk)


def extract_tar(data, dest, skipped):
    written, total = [], 0
    # arXiv e-print 는 gzip tar 다. 압축은 직접 풀어 CappedReader 로 감싸고 tar 는 스트림("r|")으로 읽는다.
    raw = gzip.GzipFile(fileobj=io.BytesIO(data)) if data[:2] == b"\x1f\x8b" else io.BytesIO(data)
    with tarfile.open(fileobj=CappedReader(raw, MAX_SCAN), mode="r|") as tf:
        for i, m in enumerate(tf):
            if i >= MAX_FILES:
                raise ValueError("파일이 2000개를 넘는다")
            if not m.isfile():  # 디렉터리 외 링크·장치 파일은 건너뛴다
                continue
            if not safe_name(m.name):
                raise ValueError(f"위험한 경로: {m.name}")
            if not m.name.lower().endswith(KEEP_EXT):
                continue
            if m.size > MAX_FILE:
                skipped.append(os.path.normpath(m.name))
                continue
            total += m.size
            if total > MAX_TOTAL:
                raise ValueError("풀린 크기가 100MB 를 넘는다")
            target = os.path.join(dest, os.path.normpath(m.name))
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with tf.extractfile(m) as src, open(target, "wb") as dst:
                dst.write(src.read())
            written.append(os.path.normpath(m.name))
    return written


def main():
    if len(sys.argv) != 3:
        out({"error": "사용: fetch_source.py <arxiv_id> <빈 출력 폴더>"})
        return 2
    arxiv_id, dest = sys.argv[1], sys.argv[2]
    if not ID_RE.match(arxiv_id):
        out({"error": f"arXiv ID 형식이 아니다: {arxiv_id}"})
        return 2
    if os.path.exists(dest) and os.listdir(dest):
        out({"error": "출력 폴더가 비어 있지 않다: 새 폴더를 쓴다"})
        return 2
    os.makedirs(dest, exist_ok=True)

    try:
        data = download(arxiv_id)
    except Exception as e:
        out({"id": arxiv_id, "error": f"다운로드 실패: {e}"})
        return 1

    if data[:4] == b"%PDF":
        out({"id": arxiv_id, "error": "TeX 소스가 없는 논문(PDF만 제공)이다. https://arxiv.org/abs/%s 의 초록·HTML 로 대신한다" % arxiv_id})
        return 1

    skipped = []
    try:
        try:
            files = extract_tar(data, dest, skipped)
        except tarfile.ReadError:
            # tar 가 아니면 gzip 으로 감싼 .tex 한 개일 수 있다
            text = gunzip_capped(data, MAX_FILE)  # .tex 한 개이므로 파일당 상한을 쓴다
            with open(os.path.join(dest, "main.tex"), "wb") as f:
                f.write(text)
            files = ["main.tex"]
    except Exception as e:
        out({"id": arxiv_id, "error": f"소스를 풀지 못했다: {e}"})
        return 1

    tex = [f for f in files if f.lower().endswith(".tex")]
    main_tex = None
    for f in sorted(tex, key=lambda x: (x.count(os.sep), x)):
        with open(os.path.join(dest, f), "rb") as fh:
            if b"\\documentclass" in fh.read(200000):
                main_tex = f
                break
    out({
        "id": arxiv_id,
        "dir": dest,
        "main": main_tex,
        "files": [{"path": f, "bytes": os.path.getsize(os.path.join(dest, f))}
                  for f in sorted(files) if f.lower().endswith(TEXT_EXT)],
        "figures": sorted(f for f in files if f.lower().endswith(FIGURE_EXT)),
        "skipped_large": skipped,
        "note": None if main_tex else "\\documentclass 가 있는 파일을 못 찾았다: files 에서 직접 고른다",
    })
    return 0


if __name__ == "__main__":
    sys.exit(main())
