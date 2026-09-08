#!/bin/bash
# PR 리뷰에 필요한 정보를 한 번에 모아 JSON으로 반환한다.
# 모델이 gh pr view / gh pr diff / gh pr view --json comments 를 따로 부를 필요가 없다.
PR="$1"
exec python3 - "$PR" <<'PY'
import subprocess, json, sys
pr = sys.argv[1] if len(sys.argv) > 1 else ''
def run(c, d=''):
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=40)
        return r.stdout.strip() if r.returncode == 0 else d
    except Exception:
        return d
def j(c):
    o = run(c)
    try: return json.loads(o) if o else {}
    except Exception: return {}

meta = j(f'gh pr view {pr} --json title,body,author,baseRefName,headRefName,files,'
         f'additions,deletions,changedFiles,reviewDecision,reviews,state')
conv = j(f'gh pr view {pr} --json comments,reviews')
diff = run(f'gh pr diff {pr}')
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
