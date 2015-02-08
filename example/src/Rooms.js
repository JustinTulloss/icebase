import {FIREBASE_URL} from './constants';

import Firebase from 'firebase';
import {seq, map, compose} from 'transducers.js';
import {ReactIceMixin, val, pluck, identity, apply} from 'icebase';
import React from 'react/addons'

var {PureRenderMixin} = React.addons;
var {li} = React.DOM;

export default React.createClass({
  mixins: [PureRenderMixin, ReactIceMixin],
  getInitialState() {
    return {
      rooms: []
    };
  },
  componentWillMount() {
    var ref = new Firebase(FIREBASE_URL).child('rooms');
    this.bindAsArray(ref, 'rooms')
  },
  render() {
    var names = seq(
      this.state.rooms,
      apply(
        identity(li),
        identity(null),
        compose(pluck('name'), map((el, name) => <li>{name}</li>)))
    );
    return <div>
      <h1>Clubs</h1>
      <ul>{names}</ul>
    </div>
  }
});
