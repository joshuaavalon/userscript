#!/usr/bin/env bash

for js in packages/*/lib/index.js ; do
  target=${js#packages/}
  target=${target/lib\/}
  target=${target%/*}
  dist=./public/"$target".js
  echo "Move $js from $dist"
  cp -- "$js" "$dist"
done
