 /*global define, document, io: true */

define(
  ["./client/game-client"], 
  function (GameClient) {

  'use strict';

  var viewport = document.getElementById('viewport');
  new GameClient(io, viewport);
    
});
