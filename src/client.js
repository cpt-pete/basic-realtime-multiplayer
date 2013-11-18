 /*jshint browser:true */
 /*global define, require, io: true */

require.config({
  paths: {
      "underscore": "/lib/underscore"
  },
  shim: {
    underscore: {
      exports: '_'
    }   
  }
});

define(
  ["./core/game-state", "./client/game-client", "./client/renderer"], 
  function (GameState, GameClient, Renderer) {

  'use strict';

  var game_state = new GameState();
  var viewport = document.getElementById('viewport');
  var renderer = new Renderer(game_state, viewport);
  
  new GameClient({}, io, game_state, renderer);  
    
});
