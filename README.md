[![Build Status](https://travis-ci.org/ReactiveX/rxjs-docs.svg?branch=master)](https://travis-ci.org/ReactiveX/rxjs-docs)

# rxjs-docs
The home for new work on the new RxJS docs (RxJS v5 and up)

License is the same as the RxJS project: https://github.com/reactivex/rxjs

[Apache 2.0 License](LICENSE.txt)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Guidelines](CONTRIBUTING.md)

## Important

By contributing or commenting on issues in this repository, whether you've read them or not, you're agreeing to the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Much like traffic laws, ignorance doesn't grant you immunity.

## Goals

- Serve updated docs for RxJs
- Serve multiple translations for the docs
- Provide working examples

## Contributing

More detailed information can be found in the [Contribution Guidelines](CONTRIBUTING.md)

## Building/Testing

The build and test structure is fairly primitive at the moment. There are various npm scripts that can be run:

- start: runs the dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
- test: runs tests with `jasmine`, must have built prior to running.
- build: build artifacts will be stored in the `dist/` directory
- build-prod: builds for production using the `--prod` flag
- commit: runs git commit wizard for passing rxjs-github-bot message validator

## Committing
It is strongly recommended that when creating a commit, you follow this procedure to start the commit wizard. It will aid you on creating valid commit messages.

```shell
git add .
npm run commit
```
