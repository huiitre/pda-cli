#!/bin/sh
# Construit pda-cli, publie la version si les commits le justifient (npm + release GitLab)
# et exporte le tag créé dans release.env (vide s'il n'y a pas de nouvelle version).
set -eu

npm run build
npx semantic-release
echo "RELEASE_TAG=$(git tag --points-at HEAD --list 'v*' | head -n1)" > release.env
