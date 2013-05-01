 /*global define, document, io: true */

define(
  ["./core/game-state", "./client/game-client", "./client/renderer"], 
  function (GameState, GameClient, Renderer) {

  'use strict';

  var game_state = new GameState();
  var viewport = document.getElementById('viewport');

  viewport.width = game_state.w;
  viewport.height = game_state.h;

  var renderer = new Renderer(game_state, viewport.getContext('2d'));
  
  new GameClient(io, game_state, renderer);
    
});
