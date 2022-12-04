#!/usr/bin/env bash

for js in packages/*/lib; do
  target=${js#packages/}
  target=${target/lib}
  dist=./public/"$target"
  echo "Move $js from $dist"
  cp -R "$js" "$dist"
done
