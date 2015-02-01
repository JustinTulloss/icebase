UGLIFY=./node_modules/.bin/uglifyjs
TRACEUR=./node_modules/.bin/traceur
TRACEURFLAGS=--modules commonjs --generators true

build/icebox.min.js: build/icebox.js
	$(UGLIFY) < $^ > $@

build/icebox.js: icebase.js
	$(TRACEUR) $(TRACEURFLAGS) --out $@ $<

clean:
	rm -rf build/*

