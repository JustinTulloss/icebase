"use strict";

exports.iter = iter;
// This library provides utilities to work with Firebase DataSnapshot objects
// in a functional and immutable fashion.

var _transducersJs = require("transducers-js");

var map = _transducersJs.map;
var comp = _transducersJs.comp;
var identity = _transducersJs.identity;
function iter(dataSnapshot) {
  return function () {
    snap.forEach(regeneratorRuntime.mark(function callee$2$0(child) {
      return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return child;
          case 2:
          case "end":
            return context$3$0.stop();
        }
      }, callee$2$0, this);
    }));
  };
}

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
var path = exports.path = comp(map(function (ref) {
  return ref.toString();
}, ref));

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
        newState[bindVar] = _this._toArray(dataSnapshot);
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
  },

  /* Converts a Firebase DataSnapshot to a JavaScript array of child snapshots */
  _toArray: function _toArray(snap) {
    return into([], identity, iter(snap));
  }
};
exports.__esModule = true;
