/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ["./server/game-server"], 
  function (GameServer) {

  'use strict';

  var server = new GameServer(4004);
    
});
