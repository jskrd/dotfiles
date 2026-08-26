#!/usr/bin/env bash
set -uo pipefail

interval=${BABYSIT_INTERVAL:-15}
once=0
[ "${1:-}" = "--once" ] && once=1

error() {
  echo "RESULT=ERROR"
  echo "REASON=$1"
}

snapshot() {
  local meta url state mergeable head base oid check_count checks valid

  if ! command -v gh >/dev/null 2>&1; then
    error "gh CLI not installed"
    return
  fi
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    error "not in a Git repository"
    return
  fi
  if [ -n "$(git status --porcelain)" ]; then
    error "working tree is not clean"
    return
  fi

  meta=$(gh pr view --json url,state,mergeable,headRefName,baseRefName,headRefOid,statusCheckRollup \
    --jq '[.url,.state,.mergeable,.headRefName,.baseRefName,.headRefOid,(.statusCheckRollup | length)] | @tsv' 2>&1) || {
      error "$meta"
      return
    }
  IFS=$'\t' read -r url state mergeable head base oid check_count <<< "$meta"

  if [ "$state" != "OPEN" ]; then
    echo "RESULT=STOP"
    echo "REASON=PR is $state"
    echo "PR=$url"
    return
  fi

  if [ "$mergeable" = "CONFLICTING" ]; then
    echo "RESULT=CONFLICT"
    echo "PR=$url"
    echo "HEAD=$head"
    echo "BASE=$base"
    return
  fi

  checks=$(gh pr checks --json bucket,name,link,workflow \
    --jq '.[] | [.bucket, (.workflow // ""), .name, (.link // "")] | @tsv' 2>&1) || true
  valid=$(printf '%s\n' "$checks" | awk -F '\t' '$1 ~ /^(pass|fail|pending|skipping|cancel)$/')

  if printf '%s\n' "$valid" | awk -F '\t' '$1 ~ /^(fail|cancel)$/ { found=1 } END { exit !found }'; then
    echo "RESULT=FAILED"
    echo "PR=$url"
    echo "HEAD=$head"
    echo "BASE=$base"
    echo "--- FAILING CHECKS ---"
    printf '%s\n' "$valid" | awk -F '\t' '$1 ~ /^(fail|cancel)$/ { print }'
    return
  fi

  if [ "$mergeable" = "UNKNOWN" ] || \
     printf '%s\n' "$valid" | awk -F '\t' '$1 == "pending" { found=1 } END { exit !found }'; then
    echo "RESULT=WAIT"
    echo "PR=$url"
    echo "HEAD=$head"
    return
  fi

  if [ "$check_count" != "0" ] && [ -z "$valid" ]; then
    error "could not read PR checks"
    return
  fi

  echo "RESULT=GREEN"
  echo "PR=$url"
  echo "HEAD=$head"
  echo "SHA=$oid"
}

main() {
  local output result previous=

  case "$interval" in
    ''|*[!0-9]*|0) error "BABYSIT_INTERVAL must be a positive integer"; return ;;
  esac

  while true; do
    output=$(snapshot)
    result=$(printf '%s\n' "$output" | sed -n 's/^RESULT=//p' | head -1)

    if [ "$once" -eq 1 ]; then
      printf '%s\n' "$output"
      return
    fi

    case "$result" in
      WAIT) previous= ;;
      GREEN)
        if [ "$previous" = "GREEN" ]; then
          printf '%s\n' "$output"
          return
        fi
        previous=GREEN
        ;;
      *) printf '%s\n' "$output"; return ;;
    esac
    sleep "$interval"
  done
}

main
