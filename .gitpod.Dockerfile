FROM gitpod/workspace-full
RUN sudo update-alternatives --set php $(which php8.1)
RUN sudo install-packages php8.1-gd php8.1-mbstring php8.1-curl php8.1-sqlite3 php8.1-zip php8.1-xdebug
RUN pnpx playwright@1.32.3 install-deps
RUN pnpx playwright@1.32.3 install
