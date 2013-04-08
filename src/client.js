 /*global io: true */

define(
  ["./client/game-client"], 
  function (GameClient) {

  'use strict';

   var client = new GameClient(io);
    
});
