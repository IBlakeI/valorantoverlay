#!/bin/bash

# Install npm if not already installed
if ! command -v npm &> /dev/null; then
    echo "Installing npm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
fi

# Load nvm if not already loaded
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install 
cd ../
source ~/.bashrc || source ~/.bash_profile || source ~/.zshrc
nvm install 19.0.0
nvm use 19.0.0

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Start the app in the dev environment
echo "Starting development..."
npm start
