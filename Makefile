install: install-deps install-flow-typed

develop:
	npx webpack-dev-server

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack
	cd dist && echo weary-fan.surge.sh > CNAME && surge
lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
