#!/usr/bin/env bash
set -uo pipefail

current_branch() {
  git rev-parse --abbrev-ref HEAD
}

default_branch() {
  local ref
  ref=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
  if [ -z "$ref" ]; then
    git remote set-head origin --auto >/dev/null 2>&1
    ref=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
  fi
  printf '%s' "${ref#origin/}"
}

origin_host() {
  git remote get-url origin 2>/dev/null \
    | sed -E 's#^[a-z]+://##; s#^[^@]+@##; s#[:/].*$##'
}

github_login() {
  local host=$1 login
  login=$(gh api user --hostname "$host" --jq .login 2>/dev/null)
  [ -z "$login" ] && login=$(gh api user --jq .login 2>/dev/null)
  printf '%s' "$login"
}

slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | tr '_' '-' \
    | sed -E 's/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-+//; s/-+$//'
}

is_protected() {
  local branch=$1 default=$2
  case "$branch" in
    "$default"|main|master) return 0 ;;
    *) return 1 ;;
  esac
}

has_upstream() {
  git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1
}

tree_is_dirty() {
  [ -n "$(git status --porcelain)" ]
}

pr_template() {
  local match
  for match in \
    "$(find .github -maxdepth 1 -iname PULL_REQUEST_TEMPLATE.md -type f 2>/dev/null | head -1)" \
    "$(find . -maxdepth 1 -iname PULL_REQUEST_TEMPLATE.md -type f 2>/dev/null | head -1)" \
    "$(find docs -maxdepth 1 -iname PULL_REQUEST_TEMPLATE.md -type f 2>/dev/null | head -1)" \
    "$(find .github/PULL_REQUEST_TEMPLATE -maxdepth 1 -type f 2>/dev/null | head -1)"
  do
    if [ -n "$match" ]; then printf '%s' "$match"; return; fi
  done
}

main() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "GH_ERROR=gh CLI not installed"
    exit 1
  fi

  local branch default host login slug
  branch=$(current_branch)
  default=$(default_branch)
  host=$(origin_host)
  login=$(github_login "$host")

  if [ -z "$login" ]; then
    echo "GH_ERROR=gh not authenticated for host $host"
    exit 1
  fi
  slug=$(slugify "$login")

  echo "CURRENT_BRANCH=$branch"
  echo "DEFAULT_BRANCH=$default"
  echo "USERNAME_SLUG=$slug"
  echo "PROTECTED=$(is_protected "$branch" "$default" && echo 1 || echo 0)"
  echo "HAS_UPSTREAM=$(has_upstream && echo 1 || echo 0)"
  echo "TREE_DIRTY=$(tree_is_dirty && echo 1 || echo 0)"
  echo "PR_TEMPLATE=$(pr_template)"
  echo "--- COMMITS ---"
  git log "$default..HEAD" --oneline 2>/dev/null
}

main
