# dotfiles

Personal machine configuration. `./bootstrap.sh` installs Homebrew dependencies and syncs everything under `home/` into `$HOME`.

## Claude Code

`home/.claude/` — instructions, agents and skills. No setup beyond `./bootstrap.sh`.

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

`home/.config/zed/settings.json` — editor settings. No setup beyond `./bootstrap.sh`.
