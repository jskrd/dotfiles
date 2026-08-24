#!/usr/bin/env bash
set -uo pipefail

section() {
  echo
  echo "=== $1 ==="
}

dump_untracked_file() {
  local path=$1
  echo "--- $path ---"
  if [ ! -s "$path" ]; then
    echo "(empty file)"
  elif LC_ALL=C grep -qI . "$path"; then
    cat -- "$path"
  else
    echo "(binary file, skipped)"
  fi
  echo
}

untracked_contents() {
  git ls-files --others --exclude-standard -z \
    | while IFS= read -r -d '' path; do dump_untracked_file "$path"; done
}

main() {
  if [ -z "$(git status --porcelain)" ]; then
    echo "NOTHING TO COMMIT"
    exit 0
  fi

  echo "=== git status --porcelain ==="
  git status --porcelain

  section "git diff (unstaged)"
  git diff

  section "git diff --staged"
  git diff --staged

  section "untracked file contents"
  untracked_contents
}

main
