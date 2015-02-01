UGLIFY=./node_modules/.bin/uglifyjs
TRACEUR=./node_modules/.bin/traceur
TRACEURFLAGS=--modules commonjs --generators true

dist/icebox.min.js: dist/icebox.js
	$(UGLIFY) < $^ > $@

dist/icebox.js: icebase.js
	$(TRACEUR) $(TRACEURFLAGS) --out $@ $<

clean:
	rm -rf build/*

