#!/bin/bash
set -euo pipefail

BUILD_DIR='../build/www'

npm link @socketsupply/latica

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
cp -r ../src/{css,index.html} $BUILD_DIR

npx esbuild \
  --tsconfig=jsconfig.json \
  --bundle \
  --format=esm \
  --define:globalThis.process.versions.node=null \
  --outfile=../build/www/index.js \
  --keep-names \
  ../src/index.js