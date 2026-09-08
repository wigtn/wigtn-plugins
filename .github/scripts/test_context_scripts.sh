#!/usr/bin/env bash
# 번들 컨텍스트 스크립트 회귀 테스트 (repo-context / repo-state / pr-context).
#
# 이 세 스크립트는 /implement·/auto-commit·/review-pr 의 첫 단계라, 조용히 틀리면
# 모델이 빈 트리나 없는 PR 을 그대로 믿고 진행한다. 실제로 리뷰에서 잡힌 결함이
# 전부 "실패했는데 성공처럼 보이는" 종류였다 - tracked-only 수집, 잘린 개수를
# 전체로 보고, 서브디렉터리 경로 어긋남, gh 실패의 빈 PR 성공 처리.
#
# 임시 저장소를 만들어 실제 실행하고 JSON 필드만 본다. 모델 호출 없음.
#
# 실행: bash .github/scripts/test_context_scripts.sh

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
S="$REPO_ROOT/plugins/wigtn-plugins/scripts"
PASS=0; FAIL=0
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

git_init() { git init -q "$1" && git -C "$1" config user.email t@t && git -C "$1" config user.name t; }

# $1 라벨  $2 기대  $3 실제
eq() {
  if [ "$2" = "$3" ]; then echo "  ok   $1"; PASS=$((PASS+1))
  else echo "  FAIL $1 - 기대 [$2] 실제 [$3]"; FAIL=$((FAIL+1)); fi
}
# $1 라벨  $2 JSON  $3 python 표현식(d 로 접근)
field() { python3 -c "
import json,sys
d=json.loads(sys.stdin.read())
print($3)" <<< "$2"; }

echo "repo-context.sh"

# 커밋하지 않은 파일도 소스 트리에 들어간다 (git ls-files 는 tracked 만 낸다)
D="$TMP/untracked"; mkdir -p "$D/src"; git_init "$D"
echo '{"scripts":{"test":"vitest"}}' > "$D/package.json"; echo x > "$D/src/app.ts"
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "커밋 전 파일이 트리에 잡힌다" "2" "$(field _ "$J" "d['file_count']")"
eq "  경로가 root 기준이다"      "src/app.ts" "$(field _ "$J" "[f for f in d['files'] if f.endswith('app.ts')][0]")"

# tracked 가 이미 있는 레포에서도 untracked 가 합쳐져야 한다.
# (커밋이 없으면 find 폴백이 결함을 가리므로 이 케이스가 진짜 회귀 검사다)
D="$TMP/mixed"; mkdir -p "$D/src"; git_init "$D"
echo a > "$D/src/committed.ts"; git -C "$D" add -A; git -C "$D" commit -q -m init
echo b > "$D/src/new.ts"
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "tracked+untracked 가 합쳐진다" "2" "$(field _ "$J" "d['file_count']")"
eq "  untracked 가 포함된다" "True" "$(field _ "$J" "'src/new.ts' in d['files']")"

# git 저장소가 아니면 find 로 떨어진다
D="$TMP/nogit"; mkdir -p "$D/src"; echo x > "$D/src/a.ts"; echo y > "$D/README.md"
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "git 아닌 디렉터리도 수집한다" "2" "$(field _ "$J" "d['file_count']")"

# .gitignore 는 존중한다
D="$TMP/ignore"; mkdir -p "$D/node_modules/p"; git_init "$D"
echo "node_modules/" > "$D/.gitignore"; echo x > "$D/app.ts"; echo n > "$D/node_modules/p/f.js"
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "node_modules 는 빠진다" "0" "$(field _ "$J" "len([f for f in d['files'] if 'node_modules' in f])")"

# 자를 때 file_count 는 자르기 전 전체 수여야 한다
D="$TMP/trunc"; mkdir -p "$D"; git_init "$D"
for i in $(seq 1 250); do echo x > "$D/f$i.txt"; done
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "file_count 는 자르기 전 개수" "250" "$(field _ "$J" "d['file_count']")"
eq "  목록은 상한까지만"          "200" "$(field _ "$J" "len(d['files'])")"
eq "  잘림을 표기한다"            "True" "$(field _ "$J" "d['files_truncated']")"

# 검증 명령 감지 - npm 외 생태계도 잡아야 한다 (빈 목록이면 모델이 검증을 건너뛴다)
detect() { # $1 디렉터리명  $2.. 생성할 파일
  local d="$TMP/eco_$1"; shift; mkdir -p "$d"; git_init "$d"
  for f in "$@"; do printf '%s' "$3" > "$d/$f"; done
  (cd "$d" && bash "$S/repo-context.sh")
}
D="$TMP/py"; mkdir -p "$D"; git_init "$D"
printf '[tool.pytest.ini_options]\nx=1\n[tool.ruff]\ny=2\n' > "$D/pyproject.toml"
J=$(cd "$D" && bash "$S/repo-context.sh")
eq "pyproject 에서 pytest 감지" "pytest" "$(field _ "$J" "d['verify_commands'].get('test')")"

D="$TMP/go"; mkdir -p "$D"; git_init "$D"; printf 'module x\ngo 1.22\n' > "$D/go.mod"
eq "go.mod 에서 go test 감지" "go test ./..." "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_commands'].get('test')")"

D="$TMP/rust"; mkdir -p "$D"; git_init "$D"; printf '[package]\nname="x"\n' > "$D/Cargo.toml"
eq "Cargo.toml 에서 cargo test 감지" "cargo test" "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_commands'].get('test')")"

D="$TMP/mk"; mkdir -p "$D"; git_init "$D"; printf 'test:\n\techo t\n' > "$D/Makefile"
eq "Makefile 타깃 감지" "make test" "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_commands'].get('test')")"

# bun·pnpm 의 test 서브커맨드는 package.json 스크립트를 돌리지 않는다
for lk in bun.lock bun.lockb; do
  D="$TMP/bun_$lk"; mkdir -p "$D"; git_init "$D"
  echo '{"scripts":{"test":"vitest"}}' > "$D/package.json"; touch "$D/$lk"
  eq "$lk -> bun run test" "bun run test" "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_commands'].get('test')")"
done
D="$TMP/pnpm"; mkdir -p "$D"; git_init "$D"
echo '{"scripts":{"test":"vitest"}}' > "$D/package.json"; touch "$D/pnpm-lock.yaml"
eq "pnpm -> pnpm run test" "pnpm run test" "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_commands'].get('test')")"

D="$TMP/plain"; mkdir -p "$D"; git_init "$D"; echo hi > "$D/README.md"
eq "감지 실패는 verify_detected=false" "False" "$(field _ "$(cd "$D" && bash "$S/repo-context.sh")" "d['verify_detected']")"

echo "repo-state.sh"

# staged·unstaged·untracked 가 모두 changed_files 에 들어간다
D="$TMP/state"; mkdir -p "$D/sub" "$D/sub2"; git_init "$D"
git -C "$D" commit -q --allow-empty -m init
echo r > "$D/root_untracked.txt"; echo s > "$D/sub/sub_untracked.txt"
echo x > "$D/sub2/x.txt"; git -C "$D" add sub2/x.txt
J=$(cd "$D" && bash "$S/repo-state.sh")
eq "세 상태가 모두 잡힌다" "3" "$(field _ "$J" "d['file_count']")"

# 서브디렉터리에서 실행해도 결과가 같아야 한다
# (git ls-files --others 는 cwd 하위만 cwd 기준 경로로 낸다)
J2=$(cd "$D/sub" && bash "$S/repo-state.sh")
eq "서브디렉터리에서도 동일" "3" "$(field _ "$J2" "d['file_count']")"
eq "  root 파일이 안 빠진다" "True" "$(field _ "$J2" "'root_untracked.txt' in d['changed_files']")"
eq "  경로가 root 기준이다"  "True" "$(field _ "$J2" "'sub/sub_untracked.txt' in d['changed_files']")"

echo "pr-context.sh"

# 셸 인젝션 - 인자가 명령으로 해석되면 안 된다
MARK="$TMP/pwned"
bash "$S/pr-context.sh" "44; touch $MARK; #" >/dev/null 2>&1
eq "인젝션 차단" "no" "$([ -e "$MARK" ] && echo yes || echo no)"

for bad in "" "abc" "44abc" '$(id)'; do
  out=$(bash "$S/pr-context.sh" "$bad" 2>/dev/null)
  eq "잘못된 입력 거부 [${bad:-빈값}]" "True" "$(field _ "$out" "'error' in d")"
done

# gh 조회 실패를 빈 PR 로 성공 처리하지 않는다 (없는 코드에 대한 리뷰 방지).
# 가짜 gh 를 PATH 앞에 두어 인증 상태와 무관하게 각 실패 지점을 재현한다.
FAKE="$TMP/bin"; mkdir -p "$FAKE"
make_gh() { # $1 view 결과(ok|fail)  $2 diff 결과(ok|fail)
  cat > "$FAKE/gh" <<GHEOF
#!/bin/bash
if [ "\$1" = "pr" ] && [ "\$2" = "diff" ]; then
  [ "$2" = "ok" ] || { echo "error: auth required" >&2; exit 1; }
  echo "diff --git a/a.ts b/a.ts"; exit 0
fi
if [ "\$1" = "pr" ] && [ "\$2" = "view" ]; then
  [ "$1" = "ok" ] || { echo "error: not found" >&2; exit 1; }
  echo '{"title":"x","state":"OPEN","files":[{"path":"a.ts"}],"additions":1,"deletions":0,"changedFiles":1,"author":{"login":"u"},"baseRefName":"main","headRefName":"f","body":"","reviewDecision":null,"reviews":[],"comments":[]}'
  exit 0
fi
exit 1
GHEOF
  chmod +x "$FAKE/gh"
}

make_gh fail fail
out=$(PATH="$FAKE:$PATH" bash "$S/pr-context.sh" 44 2>/dev/null); rc=$?
eq "메타 조회 실패는 error" "True" "$(field _ "$out" "'error' in d")"
eq "  exit code 가 0 이 아니다" "1" "$rc"

# 메타는 성공하고 diff 만 실패하는 경우 - 가장 위험한 경로
# (코드 없이 리뷰가 만들어진다)
make_gh ok fail
out=$(PATH="$FAKE:$PATH" bash "$S/pr-context.sh" 44 2>/dev/null); rc=$?
eq "diff 조회 실패도 error" "True" "$(field _ "$out" "'error' in d")"
eq "  exit code 가 0 이 아니다" "1" "$rc"

make_gh ok ok
out=$(PATH="$FAKE:$PATH" bash "$S/pr-context.sh" 44 2>/dev/null); rc=$?
eq "둘 다 성공하면 error 없음" "False" "$(field _ "$out" "'error' in d")"
eq "  exit code 0"            "0" "$rc"
eq "  diff 가 담긴다"         "True" "$(field _ "$out" "len(d['diff'])>0")"

echo
echo "통과 $PASS · 실패 $FAIL"
[ "$FAIL" -eq 0 ] || exit 1
