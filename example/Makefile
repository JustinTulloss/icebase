SERVER=./node_modules/.bin/webpack-dev-server
WEBPACK=./node_modules/.bin/webpack

SRC=$(shell find ./src -name "*.js")

build/package.js: $(SRC)
	$(WEBPACK)

dev:
	$(SERVER) -d --progress --colors --content-base ./
