UGLIFY=./node_modules/.bin/uglifyjs
ES6C=./node_modules/.bin/6to5
ES6CFLAGS=--modules umd

SRC=icebase.js

dist/icebase.min.js: dist/icebase.js
	$(UGLIFY) < $^ > $@

dist/icebase.js: $(SRC)
	$(ES6C) $(ES6CFLAGS) $< > $@

watch: $(SRC)
	$(ES6C) --watch $^ --out-file dist/icebase.js

clean:
	rm -rf dist/*
