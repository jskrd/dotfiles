#!/bin/bash

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

main() {
  install_brew_if_needed

  if confirm "Install for play?"; then
    install_brew_dependencies play
  fi

  if confirm "Install for work?"; then
    install_brew_dependencies work

    sync_home_files
  fi
}

confirm() {
  local prompt="$1"
  read -p "$prompt [y/n] " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

install_brew_if_needed() {
  if ! command -v brew >/dev/null 2>&1; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
}

install_brew_dependencies() {
  local profile="$1"
  brew bundle install --file "$REPO_DIR/Brewfile-$profile"
}

sync_home_files() {
  rsync -a "$REPO_DIR/home/" "$HOME/"
}

main
