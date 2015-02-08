// This library provides utilities to work with Firebase DataSnapshot objects
// in a functional and immutable fashion.

import {map, compose, toArray} from 'transducers.js';

// TODO: There really ought to be a way to do this with generators and iterables
// that does not involve making an intermediate array.
export function iter(dataSnapshot) {
  var children = [];
  var index = -1;
  dataSnapshot.forEach(childSnap => children.push(childSnap));
  return {
    [Symbol.iterator]: function* () {
      while (++index < children.length) {
        yield children[index];
      }
    }
  };
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
export var apply = (...xforms) => {
  debugger;
  if (!xforms.length) {
    throw new Error("You must provide at least one function to apply");
  }
  return function() {
    for (var i = 0; i < xforms.length; i++) {
      xforms[i] = xforms[i].apply(null, arguments);
    }
    if (typeof xforms[0] !== "function") {
      throw new Error("The first transducer in the call to apply must result in a function");
    }
    return xforms[0].apply(null, Array.prototype.slice.call(xforms, 1));
  }
};
export var identity = x => () => x

// Convenience transducers.
// These just allow you to extract parts of the snapshot
// within a transducer pipeline
export var val = map(snap => snap.val());
export var key = map(snap => snap.key());
export var ref = map(snap => snap.ref());
export var path = compose(map(ref => ref.toString()), ref);
export var pluck = property => compose(val, get);
export var get = (property, defVal=null) => map(val => val[property] || defVal);

export var getIn = (path, defVal=null) => compose(val, map(val => {
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

// This code is straight up ported from ReactFire
// https://github.com/firebase/reactfire
export var ReactIceMixin = {
  /********************/
  /*  MIXIN LIFETIME  */
  /********************/
  /* Initializes the Firebase binding refs array */
  componentWillMount() {
    this.firebaseRefs = {};
    this.firebaseListeners = {};
  },

  /* Removes any remaining Firebase bindings */
  componentWillUnmount() {
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
  bindAsArray(firebaseRef, bindVar, cancelCallback) {
    this._bind(firebaseRef, bindVar, cancelCallback, true);
  },

  /* Creates a binding between Firebase and the inputted bind variable as an object */
  bindAsObject(firebaseRef, bindVar, cancelCallback) {
    this._bind(firebaseRef, bindVar, cancelCallback, false);
  },

  /* Creates a binding between Firebase and the inputted bind variable as either
   * an array of DataSnapshots or a single DataSnapshot
   */
  _bind(firebaseRef, bindVar, cancelCallback, bindAsArray) {
    this._validateBindVar(bindVar);

    var errorMessage, errorCode;
    if (Object.prototype.toString.call(firebaseRef) !== "[object Object]") {
      errorMessage = "firebaseRef must be an instance of Firebase";
      errorCode = "INVALID_FIREBASE_REF";
    }
    else if (typeof bindAsArray !== "boolean") {
      errorMessage = "bindAsArray must be a boolean. Got: " + bindAsArray;
      errorCode = "INVALID_BIND_AS_ARRAY";
    }

    if (typeof errorMessage !== "undefined") {
      var error = new Error("ReactFire: " + errorMessage);
      error.code = errorCode;
      throw error;
    }

    this.firebaseRefs[bindVar] = firebaseRef.ref();
    this.firebaseListeners[bindVar] = firebaseRef.on("value", dataSnapshot => {
      var newState = {};
      if (bindAsArray) {
        newState[bindVar] = toArray(iter(dataSnapshot));
      }
      else {
        newState[bindVar] = dataSnapshot;
      }
      this.setState(newState);
    }, cancelCallback);
  },

  /* Removes the binding between Firebase and the inputted bind variable */
  unbind(bindVar) {
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
  _validateBindVar(bindVar) {
    var errorMessage;

    if (typeof bindVar !== "string") {
      errorMessage = "bindVar must be a string. Got: " + bindVar;
    }
    else if (bindVar.length === 0) {
      errorMessage = "bindVar must be a non-empty string. Got: \"\"";
    }

    if (typeof errorMessage !== "undefined") {
      var error = new Error("ReactFire: " + errorMessage);
      error.code = "INVALID_BIND_VARIABLE";
      throw error;
    }
  },
};
