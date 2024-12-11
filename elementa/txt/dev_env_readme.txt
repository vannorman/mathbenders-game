Development environment setup (from using Kelly's Macbook air)
- install a new ssh key $ssh-keygen
- add it to my github repo
- clone the repo
- install homebrew then python3 (it will prompt for developertools at some point, say yes)
- install virtualenv $python3 -m venv venv then activate it and $pip3 install -r requirements.txt
- create run_local_server.sh with  """
source venv/bin/activate
env FLASK_APP=elementa/app.py python3 -m flask run
"""
optional
- terminal colors, this is a zsh comp so ~/.zshrc add ~/.bash_profile if needed or just modify colors in terminal settings
- edit vimrc as follows (includes autocomplete instructions link) """
syntax on
set nu
filetype plugin indent on
" show existing tab with 4 spaces width
set tabstop=4
" when indenting with '>', use 4 spaces width
set shiftwidth=4
" On pressing tab, insert 4 spaces
set expandtab

" Autocomplete
" " Enable packloadall for pack plugins.
" " Via https://www.baeldung.com/linux/vim-autocomplete#:~:text=SuperTab%20is%20a%20Vim%20autocompletion,enter%20e%20and%20press%20Tab.
packloadall

" highlight search
set hlsearch
hi Search ctermbg=LightYellow
hi Search ctermfg=Red
"""
