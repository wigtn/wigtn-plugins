#!/bin/bash
# 커밋 전 상태를 한 번에 수집해 JSON으로 반환한다. 모델이 개별 명령을 돌릴 필요가 없다.
exec python3 - <<'PY'
import subprocess, json, os, glob
def run(c, d=''):
    try:
        r=subprocess.run(c, shell=True, capture_output=True, text=True, timeout=25)
        return r.stdout.strip() if r.returncode==0 else d
    except Exception: return d
def runa(args, d=''):
    # 브랜치명 등 외부 값이 섞이는 명령은 shell=False 인자 배열로 실행한다.
    try:
        r=subprocess.run(args, capture_output=True, text=True, timeout=25)
        return r.stdout.strip() if r.returncode==0 else d
    except Exception: return d
def jruna(args):
    o=runa(args)
    try: return json.loads(o) if o else []
    except Exception: return []
def jrun(c):
    o=run(c)
    try: return json.loads(o) if o else []
    except Exception: return []
root=run('git rev-parse --show-toplevel','.')
br=run('git branch --show-current')
run('git fetch origin --quiet')
staged=[x for x in run('git diff --cached --name-only').split('\n') if x]
unstaged=[x for x in run('git diff --name-only').split('\n') if x]
untracked=[x for x in run('git ls-files --others --exclude-standard').split('\n') if x]
files=sorted(set(staged+unstaged+untracked))[:50]
head_pr=jruna(['gh','pr','list','--head',br,'--state','all',
                '--json','number,state,title','--limit','1']) if br else []
state={
 'branch':br,
 'on_main': br in ('main','master'),
 'staged_stat': (run('git diff --cached --stat').split('\n') or [''])[-1],
 'unstaged_stat': (run('git diff --stat').split('\n') or [''])[-1],
 'changed_files': files,
 'file_count': len(files),
 'staged_files': staged[:50],
 'unstaged_files': unstaged[:50],
 'untracked_files': untracked[:50],
 'remotes': [x for x in run('git remote').split('\n') if x],
 'head_pr': head_pr,
 'open_prs': jrun('gh pr list --state open --json number,title,headRefName --limit 20'),
 'plan_files': sorted(glob.glob(f'{root}/docs/todo_plan/PLAN_*.md')+glob.glob(f'{root}/PLAN_*.md')+glob.glob(f'{root}/PRD.md')),
 'stale_branch': bool(head_pr) and head_pr[0].get('state') in ('MERGED','CLOSED'),
}
print(json.dumps(state, ensure_ascii=False, indent=1))
PY
