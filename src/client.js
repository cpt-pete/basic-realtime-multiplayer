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
  ["./client/game-client"], 
  function ( GameClient ) {

  'use strict';

  new GameClient({}, io);  
    
});
