// This library provides utilities to work with Firebase DataSnapshot objects
// in a functional and immutable fashion.

function getIterator(snap) {
  return function() {
    snap.forEach(function* (child) {
      yield child;
    });
  }
}

export function ice(dataSnapshot) {
  return getIterator(dataSnapshot);
}
