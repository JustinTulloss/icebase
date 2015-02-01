"use strict";
Object.defineProperties(module.exports, {
  ice: {get: function() {
      return ice;
    }},
  __esModule: {value: true}
});
var __moduleName = "../icebase.js";
function getIterator(snap) {
  return function() {
    snap.forEach($traceurRuntime.initGeneratorFunction(function $__0(child) {
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return child;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__0, this);
    }));
  };
}
function ice(dataSnapshot) {
  return getIterator(dataSnapshot);
}