FROM gitpod/workspace-full
RUN sudo update-alternatives --set php $(which php8.2)
RUN sudo install-packages php8.2-gd php8.2-mbstring php8.2-curl php8.2-sqlite3 php8.2-zip php8.2-xdebug php8.2-imagick
RUN pnpx playwright@1.32.3 install-deps
RUN pnpx playwright@1.32.3 install
RUN npm install -g pnpm@8.6.12 @withgraphite/graphite-cli

COPY .gitpod/xdebug.ini /etc/php/8.2/mods-available/xdebug.ini

RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN /home/gitpod/.deno/bin/deno completions bash > /home/gitpod/.bashrc.d/90-deno && \
  echo 'export DENO_INSTALL="/home/gitpod/.deno"' >> /home/gitpod/.bashrc.d/90-deno && \
  echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/90-deno

# Install neovim and helpers
RUN wget https://github.com/neovim/neovim/releases/download/v0.9.2/nvim-linux64.tar.gz && \
  tar xzf nvim-linux64.tar.gz && \
  sudo mv nvim-linux64 /usr/local/nvim && \
  sudo ln -s /usr/local/nvim/bin/nvim /usr/local/bin/nvim && \
  rm -rf nvim-linux64.tar.gz
RUN sudo apt-get install -y fd-find
RUN npm install -g neovim

# Install phpactor
RUN curl -Lo phpactor.phar https://github.com/phpactor/phpactor/releases/latest/download/phpactor.phar
RUN chmod a+x phpactor.phar
RUN mv phpactor.phar /usr/local/bin/phpactor

RUN curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_0.40.2_Linux_x86_64.tar.gz" \
  && tar xf lazygit.tar.gz lazygit \
  && sudo install lazygit /usr/local/bin
