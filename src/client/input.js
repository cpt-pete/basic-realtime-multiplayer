/*jshint browser:true */
/*global THREEx, define: true */

define(
  function () {

    'use strict';
    
    var keyboard = new THREEx.KeyboardState(); 

    return{

      get_move : function(){      

        var move = [];        

        if( keyboard.pressed('A') ||
          keyboard.pressed('left')) {
            move.push('l');
        } 

        if( keyboard.pressed('D') ||
          keyboard.pressed('right')) {
            move.push('r');
        } 

        if( keyboard.pressed('S') ||
          keyboard.pressed('down')) {
            move.push('d');
        } 

        if( keyboard.pressed('W') ||
          keyboard.pressed('up')) {
            move.push('u');
        } 

        return move;
      }
    };
    
});
