" Enable line numbers
set number

" Enable relative line numbers
set relativenumber

" Enable syntax highlighting
syntax on

" Auto-detect file type and load appropriate syntax highlighting
filetype plugin indent on

" Enable syntax highlighting for all major languages
augroup filetypedetect
  autocmd!
  autocmd BufRead,BufNewFile *.py      set filetype=python
  autocmd BufRead,BufNewFile *.js      set filetype=javascript
  autocmd BufRead,BufNewFile *.html    set filetype=html
  autocmd BufRead,BufNewFile *.css     set filetype=css
  autocmd BufRead,BufNewFile *.sh      set filetype=sh
  autocmd BufRead,BufNewFile *.c       set filetype=c
  autocmd BufRead,BufNewFile *.cpp     set filetype=cpp
  autocmd BufRead,BufNewFile *.java    set filetype=java
  autocmd BufRead,BufNewFile *.rb      set filetype=ruby
  autocmd BufRead,BufNewFile *.php     set filetype=php
  autocmd BufRead,BufNewFile *.pl      set filetype=perl
  autocmd BufRead,BufNewFile *.go      set filetype=go
  autocmd BufRead,BufNewFile *.rs      set filetype=rust
  autocmd BufRead,BufNewFile *.ts      set filetype=typescript
  autocmd BufRead,BufNewFile *.lua     set filetype=lua
  autocmd BufRead,BufNewFile *.md      set filetype=markdown
augroup END

" Navigate between vim panes using Ctrl + h/j/k/l
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Split window vertically with Space + |
nnoremap <Space>\| :vsplit<CR>
" Split window horizontally with Space + -
nnoremap <Space>- :split<CR> 
