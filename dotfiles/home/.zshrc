# Path Variables
export TERM='xterm-256color'
export EDITOR='nvim'
export VISUAL='nvim'

# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
ZSH_THEME="powerlevel10k/powerlevel10k"

typeset -g POWERLEVEL9K_INSTANT_PROMPT=quiet

# Which plugins would you like to load?
plugins=(
  git
  zsh-autosuggestions
  zsh-completions
  colored-man-pages
  command-not-found
  extract
  themes
  zsh-syntax-highlighting
)

# for zsh-completions plygin
autoload -U compinit && compinit
source $ZSH/oh-my-zsh.sh

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# JAVA
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"

# Move to the beginning of the line. `Cmd + Left Arrow`:
bindkey "^[[1;9D" beginning-of-line
# Move to the end of the line. `Cmd + Right Arrow`:
bindkey "^[[1;9C" end-of-line
# Move to the beginning of the previous word. `Option + Left Arrow`:
bindkey "^[[1;3D" backward-word
# Move to the beginning of the next word. `Option + Right Arrow`:
bindkey "^[[1;3C" forward-word
# Delete the word behind the cursor. `Option + Delete`:
bindkey "^[[3;10~" backward-kill-word
# Delete the word after the cursor. `Option + fn + Delete`:
bindkey "^[[3;3~" kill-word

# ---- Eza (better ls) -----
alias ls="eza --icons=always" 

# FZF
alias fzf="fzf --preview='bat --color=always {}'"

### 🔴 MAIN ALIASES 🔴 ###

# python aliases
alias python3=/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11
alias python=/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11
alias p3=/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11
alias pip='pip3'

# git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'
alias gac='git add . && git commit -m'

# cli aliases
alias cl='clear'
alias cdp='cd ~/Developer/'
alias jn='jupyter notebook'
alias jl='jupyterlab'

# Added by Amplify CLI binary installer
export PATH="$HOME/.amplify/bin:$PATH"

# home server
alias xps='ssh nafisk@192.168.1.181'
alias pc='ssh nafisk@192.168.1.226'

# terminal editor alias
alias n='nvim'
alias plz='sudo'
alias please='sudo'
alias .='open .'

# tmux 
# alias tmux="TERM=screen-256color-bce tmux"
alias tmux="TERM=screen-256color-bce tmux"
alias tm='tmux'
alias tmks='tmux kill server'
alias x='exit'

# video downlaoder
alias yt='yt-dlp'
alias gl='gallery-dl'
alias vlc='/Applications/VLC.app/Contents/MacOS/VLC'

export PATH="$HOME/.local/bin:$PATH"

# Added by Antigravity
export PATH="/Users/nafiskhan/.antigravity/antigravity/bin:$PATH"

# OpenCode
alias oc='opencode'
alias oc-web='openclaw dashboard'
[ -f "/Users/nafiskhan/.openclaw/completions/openclaw.zsh" ] && source "/Users/nafiskhan/.openclaw/completions/openclaw.zsh"

# Added by LM Studio CLI (lms)
export PATH="$PATH:/Users/nafiskhan/.cache/lm-studio/bin"
# End of LM Studio CLI section

[[ "$TERM_PROGRAM" == "kiro" ]] && . "$(kiro --locate-shell-integration-path zsh)"
