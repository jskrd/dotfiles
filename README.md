# dotfiles

Personal machine configuration: Homebrew apps and everything under `home/`, synced into `$HOME`.

## Install

From the repo root; each step is independent.

Homebrew (skip if installed):

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Work apps:

```sh
brew bundle --file Brewfile-work
```

Play apps:

```sh
brew bundle --file Brewfile-play
```

Sync home directory (overwrites matching files in `~`):

```sh
rsync -a home/ ~/
```

## Claude Code

`home/.claude/` — settings, instructions, agents and skills. No setup beyond syncing. Claude Code writes to `~/.claude/settings.json` itself, so anything changed in-app (`/config`, plugins) must be copied back here or the next sync reverts it.

## Git

`home/.gitconfig` — default identity, with commit signing via 1Password. It ends by including `~/.config/git/local`, which is deliberately not in this repo. Create it manually — on a work machine you'll likely want your full name and work email:

```gitconfig
# ~/.config/git/local
[user]
  name = John Smith
  email = john.smith@org-a.com
  signingkey = ssh-ed25519 AAAA...
```

For more than one profile, add a conditional include scoped to that org's directory. Only the differing values need repeating:

```gitconfig
# ~/.config/git/local
[user]
  name = John Smith
  email = john.smith@org-a.com
  signingkey = ssh-ed25519 AAAA...
[includeIf "gitdir:~/Code/github.com/org-b/"]
  path = ~/.config/git/local-org-b
```

```gitconfig
# ~/.config/git/local-org-b
[user]
  email = john.smith@org-b.com
  signingkey = ssh-ed25519 BBBB...
```

## Zed

`home/.config/zed/settings.json` — editor settings. No setup beyond syncing.
