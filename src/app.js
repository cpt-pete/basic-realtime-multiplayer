/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./server/web-server', './server/transport', "./server/game-lobby"], 
  function (webserver, Transport, GameLobby) {

  'use strict';

  var server = webserver(process.env.PORT || 5000);
  var transport = new Transport(server);
  var lobby = new GameLobby(transport);
    
});
