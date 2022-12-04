#!/usr/bin/env bash

for js in packages/*/lib/index.js ; do
  target=${js#packages/}
  target=${target/lib\/}
  target=${target%/*}
  cp -- "$js" ./public/"$target".js
done
