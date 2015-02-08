UGLIFY=./node_modules/.bin/uglifyjs
ES6C=./node_modules/.bin/6to5
ES6CFLAGS=--modules umd -i selfContained

SRC=icebase.js

node_modules: package.json
	npm install .

dist/icebase.min.js: dist/icebase.js
	$(UGLIFY) < $^ > $@

dist/icebase.js: $(SRC)
	$(ES6C) $(ES6CFLAGS) $< > $@

watch: $(SRC) | node_modules
	$(ES6C) $(ES6CFLAGS) --watch $^ --out-file dist/icebase.js

publish: dist/icebase.js
	npm publish

clean:
	rm -rf dist/*
