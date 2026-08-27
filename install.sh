#!/bin/bash

set -eEuo pipefail
trap 'echo "install.sh: failed: $BASH_COMMAND" >&2' ERR

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
readonly REPO_DIR

main() {
  require_tty
  authenticate_sudo
  install_brew_if_needed

  if confirm "Install for play?"; then
    install_brew_dependencies play
  fi

  if confirm "Install for work?"; then
    install_brew_dependencies work

    sync_home_files
  fi

  echo "Done."
}

die() {
  echo "$1" >&2
  exit 1
}

require_tty() {
  [[ -t 0 && -r /dev/tty ]] || die "install.sh requires an interactive terminal"
}

authenticate_sudo() {
  sudo -v

  while true; do
    sudo -n true || true
    sleep 60
    kill -0 "$$" 2>/dev/null || exit
  done 2>/dev/null &

  sudo_keepalive_pid=$!
  trap 'kill "$sudo_keepalive_pid" 2>/dev/null || true' EXIT
}

confirm() {
  local prompt="$1"
  local reply=""
  read -p "$prompt [y/n] " -n 1 -r reply < /dev/tty
  echo
  [[ $reply =~ ^[Yy]$ ]]
}

install_brew_if_needed() {
  if command -v brew >/dev/null 2>&1; then
    return
  fi

  local installer
  installer="$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  NONINTERACTIVE=1 /bin/bash -c "$installer"

  local brew_bin
  for brew_bin in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    if [[ -x "$brew_bin" ]]; then
      eval "$("$brew_bin" shellenv)"
      break
    fi
  done

  command -v brew >/dev/null 2>&1 || die "Homebrew installed but brew is still not on PATH"
}

install_brew_dependencies() {
  local profile="$1"
  local file="$REPO_DIR/Brewfile-$profile"

  brew bundle install --file "$file"
  brew bundle check --no-upgrade --file "$file" || die "Brewfile-$profile is not fully installed"
}

sync_home_files() {
  rsync -a "$REPO_DIR/home/" "$HOME/"
}

main
