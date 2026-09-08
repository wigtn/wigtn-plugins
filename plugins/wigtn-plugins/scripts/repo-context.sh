#!/bin/bash
# 구현 시작 전 레포 상태를 한 번에 수집해 JSON으로 반환한다.
# 모델이 ls/find/cat/npm test 를 개별로 돌려가며 알아낼 필요가 없다.
exec python3 - <<'PY'
import subprocess, json, os, glob, re
def run(c, d=''):
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=25)
        return r.stdout.strip() if r.returncode == 0 else d
    except Exception:
        return d

root = run('git rev-parse --show-toplevel', '.')
os.chdir(root)

# 소스 트리 (노이즈 제외, 상한 200)
files = [f for f in run(
    "git ls-files 2>/dev/null || find . -type f -not -path './.git/*' -not -path './node_modules/*'"
).split('\n') if f][:200]

pkg = {}
if os.path.exists('package.json'):
    try: pkg = json.load(open('package.json'))
    except Exception: pkg = {}
scripts = pkg.get('scripts', {})

# 실제로 도는 검증 명령만 고른다 — 모델이 시행착오로 찾지 않도록
verify = {}
for key in ('test', 'typecheck', 'lint', 'build'):
    if key in scripts:
        verify[key] = f'npm run {key}' if key != 'test' else 'npm test'

state = {
 'root': root,
 'branch': run('git branch --show-current'),
 'file_count': len(files),
 'files': files,
 'dirs': sorted({os.path.dirname(f) for f in files if os.path.dirname(f)})[:40],
 'package_json': {'type': pkg.get('type'), 'scripts': scripts, 'deps': sorted((pkg.get('dependencies') or {}).keys())[:30]},
 'verify_commands': verify,
 'runtime': {'node': run('node -v'), 'python': run('python3 -V')},
 'prd_files': sorted(glob.glob('docs/prd/PRD_*.md') + glob.glob('docs/todo_plan/PRD.md') + glob.glob('PRD.md')),
 'plan_files': sorted(glob.glob('docs/todo_plan/PLAN_*.md') + glob.glob('PLAN_*.md')),
 'screen_specs': sorted(glob.glob('docs/prd/screens/*/*.md'))[:20],
 'git_status': run('git status --short'),
 'recent_commits': run('git log --oneline -5'),
}
print(json.dumps(state, ensure_ascii=False, indent=1))
PY
