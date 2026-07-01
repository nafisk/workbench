## Basic Commands

- Start a new session: `tmux`
- Start a new session with a name: `tmux new -s session_name`
- Detach from a session: `Ctrl+a d`
- List all sessions: `tmux ls`
- Attach to a session: `tmux attach -t session_name`
- Kill a session: `tmux kill-session -t session_name`

### Windows Management

- Create a new window: `Ctrl+a c`
- Switch to the next/previous window: `Ctrl+a n/p`
- Switch to a specific window by index: `Ctrl+a <number>` (starting from 1)
- Rename the current window: `Ctrl+a ,` (then type the new name and press Enter)
- Close the current window: `Ctrl+a &`

### Panes Management

- Split window horizontally/vertically: `Ctrl+a | / Ctrl+a -`
- Switch to the next/previous pane: `Ctrl+a o / Ctrl+a ;`
- Resize pane (down/up/right/left): `Ctrl+a j/k/l/h`
- Maximize/Minimize pane: `Ctrl+a m`
- Close the current pane: `Ctrl+a x`

### Session Management

- Rename the session: `Ctrl+a $`
- Move window to another session: `Ctrl+a :move-window -t session_name`
- Switch between sessions: `Ctrl+a s`

### Miscellaneous

- Reload tmux configuration: `Ctrl+a r`
- Scroll in pane history: `Ctrl+a [` (then use arrow keys or vim keys)

### Command Mode

- Enter command mode: `Ctrl+a :`
  - Once in command mode, you can type commands like `kill-window`, `new-session`, etc.

### Copy Mode (for copying text)

- Enter copy mode: `Ctrl+a [`
- Use vim movements:
  - Move cursor: Use arrow keys or vim keys (`h/j/k/l`)
  - Start selecting text: `v`
  - Copy selected text: `y`
- Paste text: `Ctrl+a ]`
