#!/bin/sh

echo "Downloading latest Atom release on the stable channel..."
curl -s -L "https://atom.io/download/deb?channel=stable" \
  -H 'Accept: application/octet-stream' \
  -o "atom-amd64.deb"
# /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
# export DISPLAY=":99"
dpkg-deb -x atom-amd64.deb "${HOME}/atom"
export APM_SCRIPT_PATH="${HOME}/atom/usr/bin"
export PATH="${APM_SCRIPT_PATH}:${PATH}"

echo "Using APM version:"
apm -v

# Use the system NPM to install the devDependencies
echo "Using Node version:"
node --version
echo "Using NPM version:"
npm --version
echo "Installing remaining dependencies..."
npm install

echo "Running semantic-release..."
npm run semantic-release
