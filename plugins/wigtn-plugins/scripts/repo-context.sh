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

# 소스 트리 — tracked + untracked(.gitignore 존중).
# git ls-files 만 쓰면 아직 커밋 안 한 파일이 통째로 빠진다(새 프로젝트/작업 중 레포).
tracked   = run('git ls-files')
untracked = run('git ls-files --others --exclude-standard')
found = [f for f in (tracked + '\n' + untracked).split('\n') if f]
if not found:  # git 저장소가 아니면
    found = [f for f in run(
        "find . -type f -not -path './.git/*' -not -path './node_modules/*'"
    ).split('\n') if f]
all_files = sorted(set(found))
FILE_LIMIT = 200
files = all_files[:FILE_LIMIT]

pkg = {}
if os.path.exists('package.json'):
    try: pkg = json.load(open('package.json'))
    except Exception: pkg = {}
scripts = pkg.get('scripts', {})

# 검증 명령을 실제 프로젝트 파일에서 감지한다 — 모델이 시행착오로 찾지 않도록.
# 감지 못 하면 verify_commands 를 비우고 verify_detected=false 로 알린다.
# (커맨드 계약: 비어 있으면 모델이 직접 찾는다. 임의로 검증을 건너뛰지 않는다.)
verify = {}

# JS/TS — 락파일로 패키지 매니저를 맞춘다
if scripts:
    pm = 'npm'
    for lock, name in (('pnpm-lock.yaml','pnpm'), ('yarn.lock','yarn'), ('bun.lockb','bun')):
        if os.path.exists(lock): pm = name; break
    for key in ('test', 'typecheck', 'lint', 'build'):
        if key in scripts:
            verify[key] = f'{pm} test' if (key == 'test' and pm != 'pnpm') else f'{pm} run {key}'

# Python
if os.path.exists('pyproject.toml'):
    try: t = open('pyproject.toml', encoding='utf-8').read()
    except Exception: t = ''
    if 'pytest' in t: verify.setdefault('test', 'pytest')
    if 'ruff' in t: verify.setdefault('lint', 'ruff check .')
    if 'mypy' in t: verify.setdefault('typecheck', 'mypy .')
elif os.path.exists('tox.ini') or os.path.exists('pytest.ini'):
    verify.setdefault('test', 'pytest')

# Go
if os.path.exists('go.mod'):
    verify.setdefault('test', 'go test ./...')
    verify.setdefault('typecheck', 'go vet ./...')

# Rust
if os.path.exists('Cargo.toml'):
    verify.setdefault('test', 'cargo test')
    verify.setdefault('lint', 'cargo clippy')

# Makefile — 실제로 정의된 타깃만
if os.path.exists('Makefile'):
    try: mk = open('Makefile', encoding='utf-8').read()
    except Exception: mk = ''
    for tgt in ('test', 'lint', 'check', 'typecheck'):
        if re.search(rf'^{tgt}:', mk, re.M): verify.setdefault(tgt, f'make {tgt}')

state = {
 'root': root,
 'branch': run('git branch --show-current'),
 'file_count': len(all_files),
 'files': files,
 'files_truncated': len(all_files) > FILE_LIMIT,
 'dirs': sorted({os.path.dirname(f) for f in all_files if os.path.dirname(f)})[:40],
 'package_json': {'type': pkg.get('type'), 'scripts': scripts, 'deps': sorted((pkg.get('dependencies') or {}).keys())[:30]},
 'verify_commands': verify,
 'verify_detected': bool(verify),
 'runtime': {'node': run('node -v'), 'python': run('python3 -V')},
 'prd_files': sorted(glob.glob('docs/prd/PRD_*.md') + glob.glob('docs/todo_plan/PRD.md') + glob.glob('PRD.md')),
 'plan_files': sorted(glob.glob('docs/todo_plan/PLAN_*.md') + glob.glob('PLAN_*.md')),
 'screen_specs': sorted(glob.glob('docs/prd/screens/*/*.md'))[:20],
 'git_status': run('git status --short'),
 'recent_commits': run('git log --oneline -5'),
}
print(json.dumps(state, ensure_ascii=False, indent=1))
PY
