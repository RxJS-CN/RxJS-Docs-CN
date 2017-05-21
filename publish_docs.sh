#!/usr/bin/env bash
#
# Generates documentation and pushes it up to the site
#
rm -rf tmp/docs && \
  npm run build_docs && \
  git checkout gh-pages && \
  git pull origin gh-pages && \
  cp -r ./tmp/docs/ ./ && \
  rm -rf tmp/ && \
  git add . && \
  git commit -am "chore(docs): docs generated automatically" && \
  git push origin gh-pages
