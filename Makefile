install: install-deps install-flow-typed

develop:
	npx webpack-dev-server

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

deploy:
	cd dist && echo weary-fan.surge.sh > CNAME && surge

prod:
	make build
	make deploy

lint:
	npx eslint .

publish:
	npm publish --dry-run

publink:
	make publish && npm link
.PHONY: test
