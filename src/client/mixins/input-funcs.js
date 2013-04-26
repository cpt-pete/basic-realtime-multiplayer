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


          /*if(input.length) {
               
              this.input_seq += 1;


              this.me.inputs.push({
                  inputs : input,
                  time : this.local_time.fixed(3),
                  seq : this.input_seq
              });
                  
              var server_packet = 'i.';
                  server_packet += input.join('-') + '.';
                  server_packet += this.local_time.toFixed(3).replace('.','-') + '.';
                  server_packet += this.input_seq;
                  //Go
              this.socket.send(  server_packet  );      
        
          }*/
      };     
  };    
});
