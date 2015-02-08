(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "6to5-runtime/regenerator", "transducers.js", "6to5-runtime/core-js"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("6to5-runtime/regenerator"), require("transducers.js"), require("6to5-runtime/core-js"));
  }
})(function (exports, _to5RuntimeRegenerator, _transducersJs, _to5RuntimeCoreJs) {
  "use strict";

  var _regeneratorRuntime = _to5RuntimeRegenerator;
  var _core = _to5RuntimeCoreJs;


  // TODO: There really ought to be a way to do this with generators and iterables
  // that does not involve making an intermediate array.
  exports.iter = iter;
  // This library provides utilities to work with Firebase DataSnapshot objects
  // in a functional and immutable fashion.

  var map = _transducersJs.map;
  var compose = _transducersJs.compose;
  var toArray = _transducersJs.toArray;
  function iter(dataSnapshot) {
    var children = [];
    var index = -1;
    dataSnapshot.forEach(function (childSnap) {
      return children.push(childSnap);
    });
    return (function () {
      var _ref = {};

      _ref[_core.Symbol.iterator] = _regeneratorRuntime.mark(function callee$2$0() {
        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              if (!(++index < children.length)) {
                context$3$0.next = 5;
                break;
              }
              context$3$0.next = 3;
              return children[index];
            case 3:
              context$3$0.next = 0;
              break;
            case 5:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      });
      return _ref;
    })();
  }

  /*
  
  I need to put this away for a bit.
  
  What I'm trying to do is specify a function with a sequence of xforms as its
  arguments. It should evaluate those and then call the function with the resulting
  array.
  
  What would be awesome is if you could, given a piece of data, determine what
  function to call in one xform, then choose each of the arguments in separate
  xforms, and finally call it and return the reduced result.
  
  class Fxn {
    constructor(fxn, context) {
      this.fxn = fxn;
      this.context = context;
    }
    init() {
      this.args = [];
    }
    step(result, input) {
      this.args.push(input.xform.
    }
    result() {
      return this.fxn.apply(this.ctx, this.args);
    }
  }
  */

  // XXX Don't belong in this lib
  var apply = exports.apply = function () {
    for (var _len = arguments.length, xforms = Array(_len), _key = 0; _key < _len; _key++) {
      xforms[_key] = arguments[_key];
    }

    debugger;
    if (!xforms.length) {
      throw new Error("You must provide at least one function to apply");
    }
    return function () {
      for (var i = 0; i < xforms.length; i++) {
        xforms[i] = xforms[i].apply(null, arguments);
      }
      if (typeof xforms[0] !== "function") {
        throw new Error("The first transducer in the call to apply must result in a function");
      }
      return xforms[0].apply(null, Array.prototype.slice.call(xforms, 1));
    };
  };
  var identity = exports.identity = function (x) {
    return function () {
      return x;
    };
  };

  // Convenience transducers.
  // These just allow you to extract parts of the snapshot
  // within a transducer pipeline
  var val = exports.val = map(function (snap) {
    return snap.val();
  });
  var key = exports.key = map(function (snap) {
    return snap.key();
  });
  var ref = exports.ref = map(function (snap) {
    return snap.ref();
  });
  var path = exports.path = compose(map(function (ref) {
    return ref.toString();
  }), ref);
  var pluck = exports.pluck = function (property) {
    return compose(val, get);
  };
  var get = exports.get = function (property) {
    var defVal = arguments[1] === undefined ? null : arguments[1];
    return map(function (val) {
      return val[property] || defVal;
    });
  };

  var getIn = exports.getIn = function (path) {
    var defVal = arguments[1] === undefined ? null : arguments[1];
    return compose(val, map(function (val) {
      var returnVal;
      var prop;
      while (prop = path.pop()) {
        returnVal = val[prop];
        if (returnVal === undefined) {
          return defVal;
        }
      }
      return returnVal;
    }));
  };

  // This code is straight up ported from ReactFire
  // https://github.com/firebase/reactfire
  var ReactIceMixin = exports.ReactIceMixin = {
    /********************/
    /*  MIXIN LIFETIME  */
    /********************/
    /* Initializes the Firebase binding refs array */
    componentWillMount: function componentWillMount() {
      this.firebaseRefs = {};
      this.firebaseListeners = {};
    },

    /* Removes any remaining Firebase bindings */
    componentWillUnmount: function componentWillUnmount() {
      for (var key in this.firebaseRefs) {
        if (this.firebaseRefs.hasOwnProperty(key)) {
          this.unbind(key);
        }
      }
    },


    /*************/
    /*  BINDING  */
    /*************/
    /* Creates a binding between Firebase and the inputted bind variable as an array */
    bindAsArray: function bindAsArray(firebaseRef, bindVar, cancelCallback) {
      this._bind(firebaseRef, bindVar, cancelCallback, true);
    },

    /* Creates a binding between Firebase and the inputted bind variable as an object */
    bindAsObject: function bindAsObject(firebaseRef, bindVar, cancelCallback) {
      this._bind(firebaseRef, bindVar, cancelCallback, false);
    },

    /* Creates a binding between Firebase and the inputted bind variable as either
     * an array of DataSnapshots or a single DataSnapshot
     */
    _bind: function _bind(firebaseRef, bindVar, cancelCallback, bindAsArray) {
      var _this = this;
      this._validateBindVar(bindVar);

      var errorMessage, errorCode;
      if (Object.prototype.toString.call(firebaseRef) !== "[object Object]") {
        errorMessage = "firebaseRef must be an instance of Firebase";
        errorCode = "INVALID_FIREBASE_REF";
      } else if (typeof bindAsArray !== "boolean") {
        errorMessage = "bindAsArray must be a boolean. Got: " + bindAsArray;
        errorCode = "INVALID_BIND_AS_ARRAY";
      }

      if (typeof errorMessage !== "undefined") {
        var error = new Error("ReactFire: " + errorMessage);
        error.code = errorCode;
        throw error;
      }

      this.firebaseRefs[bindVar] = firebaseRef.ref();
      this.firebaseListeners[bindVar] = firebaseRef.on("value", function (dataSnapshot) {
        var newState = {};
        if (bindAsArray) {
          newState[bindVar] = toArray(iter(dataSnapshot));
        } else {
          newState[bindVar] = dataSnapshot;
        }
        _this.setState(newState);
      }, cancelCallback);
    },

    /* Removes the binding between Firebase and the inputted bind variable */
    unbind: function unbind(bindVar) {
      this._validateBindVar(bindVar);

      if (typeof this.firebaseRefs[bindVar] === "undefined") {
        var error = new Error("ReactFire: unexpected value for bindVar. \"" + bindVar + "\" was either never bound or has already been unbound");
        error.code = "UNBOUND_BIND_VARIABLE";
        throw error;
      }

      this.firebaseRefs[bindVar].off("value", this.firebaseListeners[bindVar]);
      delete this.firebaseRefs[bindVar];
      delete this.firebaseListeners[bindVar];
    },


    /*************/
    /*  HELPERS  */
    /*************/
    /* Validates the name of the variable which is being bound */
    _validateBindVar: function _validateBindVar(bindVar) {
      var errorMessage;

      if (typeof bindVar !== "string") {
        errorMessage = "bindVar must be a string. Got: " + bindVar;
      } else if (bindVar.length === 0) {
        errorMessage = "bindVar must be a non-empty string. Got: \"\"";
      }

      if (typeof errorMessage !== "undefined") {
        var error = new Error("ReactFire: " + errorMessage);
        error.code = "INVALID_BIND_VARIABLE";
        throw error;
      }
    } };
  exports.__esModule = true;
});
