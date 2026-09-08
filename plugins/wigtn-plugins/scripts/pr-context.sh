#!/bin/bash
# PR 리뷰에 필요한 정보를 한 번에 모아 JSON으로 반환한다.
# 모델이 gh pr view / gh pr diff / gh pr view --json comments 를 따로 부를 필요가 없다.
PR="$1"
if ! command -v python3 >/dev/null 2>&1; then
  printf '{"error":"python3 가 필요하다 — 설치 후 다시 실행"}\n'
  exit 1
fi
exec python3 - "$PR" <<'PY'
import subprocess, json, sys, re

# PR 참조는 숫자 또는 GitHub PR URL 만 받는다. 셸에 넘기지 않지만,
# 잘못된 입력을 조용히 흘려보내지 않도록 여기서 잘라낸다.
raw = sys.argv[1] if len(sys.argv) > 1 else ''
m = re.fullmatch(
    r'\s*(?:https?://[^\s/]+/(?P<owner>[^\s/]+)/(?P<repo>[^\s/]+)/pull/)?#?(?P<num>\d{1,10})\s*',
    raw or '')
if not m:
    print(json.dumps({'error': 'PR 번호 또는 GitHub PR URL 이 필요하다', 'given': raw},
                     ensure_ascii=False))
    sys.exit(1)
pr = m.group('num')
# URL 로 받았으면 그 레포를 그대로 쓴다. 번호만 뽑으면 현재 레포의 동일 번호 PR 을
# 조용히 리뷰하게 된다.
repo_args = (['--repo', f"{m.group('owner')}/{m.group('repo')}"]
             if m.group('owner') and m.group('repo') else [])

def run(args, d=''):
    # shell=False. 인자 배열이라 PR 번호가 명령으로 해석되지 않는다.
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=40)
        return r.stdout.strip() if r.returncode == 0 else d
    except Exception:
        return d

def j(args):
    o = run(args)
    try: return json.loads(o) if o else {}
    except Exception: return {}

meta = j(['gh', 'pr', 'view', pr] + repo_args + ['--json',
          'title,body,author,baseRefName,headRefName,files,'
          'additions,deletions,changedFiles,reviewDecision,reviews,state'])
conv = j(['gh', 'pr', 'view', pr] + repo_args + ['--json', 'comments,reviews'])
# 조회가 실패하면 빈 PR 로 성공 처리하지 않는다. 리뷰 커맨드의 가장 위험한 실패
# 모드가 "없는 코드에 대한 리뷰"라, 입력 검증과 같은 fail-closed 로 맞춘다.
if not meta:
    print(json.dumps({'pr': pr,
                      'error': 'gh pr view 실패 — PR 번호·인증·레포를 확인'},
                     ensure_ascii=False))
    sys.exit(1)
diff = run(['gh', 'pr', 'diff', pr] + repo_args)
LIMIT = 60000
print(json.dumps({
 'pr': pr,
 'state': meta.get('state'),
 'title': meta.get('title'),
 'body': meta.get('body'),
 'author': (meta.get('author') or {}).get('login'),
 'base': meta.get('baseRefName'), 'head': meta.get('headRefName'),
 'files': meta.get('files', []),
 'stats': {'additions': meta.get('additions'), 'deletions': meta.get('deletions'),
           'changed_files': meta.get('changedFiles')},
 'existing_comments': conv.get('comments', []),
 'existing_reviews': conv.get('reviews', []),
 'diff_truncated': len(diff) > LIMIT,
 'diff': diff[:LIMIT],
}, ensure_ascii=False, indent=1))
PY
