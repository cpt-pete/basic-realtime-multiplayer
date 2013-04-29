/*global 
    THREEx,
    define: true 
*/

define(
  function () {

    'use strict';
      
    return function(){

      this.keyboard = new THREEx.KeyboardState(); 

      this.sample_inputs = function(){      

        var input = [];        

        if( this.keyboard.pressed('A') ||
            this.keyboard.pressed('left')) {
                input.push('l');
        } 

        if( this.keyboard.pressed('D') ||
            this.keyboard.pressed('right')) {
                input.push('r');
        } 

        if( this.keyboard.pressed('S') ||
            this.keyboard.pressed('down')) {
                input.push('d');
        } 

        if( this.keyboard.pressed('W') ||
            this.keyboard.pressed('up')) {
                input.push('u');
        } 

        return input;
      };     
  };    
});
