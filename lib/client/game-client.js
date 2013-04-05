/*global 
    define, require: true 
*/

define(["game"],function (Game) {

    'use strict';

    function GameClient(io){
      connect(io);
    }

    var on_netmessage = function(data) {

      var commands = data.split('.');
      var command = commands[0];
      var subcommand = commands[1] || null;
      var commanddata = commands[2] || null;

      switch(command) {
        case 's': //server message

        switch(subcommand) {

          case 'h' : //host a game requested
            this.client_onhostgame(commanddata); break;

          case 'j' : //join a game requested
            this.client_onjoingame(commanddata); break;

          case 'r' : //ready a game requested
            this.client_onreadygame(commanddata); break;

          case 'e' : //end game requested
            this.client_ondisconnect(commanddata); break;

          case 'p' : //server ping
            this.client_onping(commanddata); break;
          }

          break; 
      }       
    };

    var on_disconnect = function(){

    };

    var on_connected = function(){

    };

    var on_serverupdate_recieved = function(){

    };

    var update = function() {

          //Clear the screen area
      /*this.ctx.clearRect(0,0,720,480);

      //draw help/information if required
      this.client_draw_info();

      //Capture inputs from the player
      this.client_handle_input();

      //Network player just gets drawn normally, with interpolation from
      //the server updates, smoothing out the positions from the past.
      //Note that if we don't have prediction enabled - this will also
      //update the actual local client position on screen as well.

      this.client_process_net_updates();

      //Now they should have updated, we can draw the entity
      this.players.other.draw();

      //When we are doing client side prediction, we smooth out our position
      //across frames using local input states we have stored.
      this.client_update_local_position();

      //And then we finally draw
      this.players.self.draw();*/

    }; //game_core.update_client
    
    var connect = function (io) {
        
      //Store a local reference to our connection to the server
      this.socket = io.connect();

      //When we connect, we are not 'connected' until we have a server id
      //and are placed in a game by the server. The server sends us a message for that.
      this.socket.on('connect', function(){
        console.log("connecting");
        //this.players.self.state = 'connecting';
      }.bind(this));

      //Sent when we are disconnected (network, server down, etc)
      this.socket.on('disconnect', on_disconnect);
      //Sent each tick of the server simulation. This is our authoritive update
      this.socket.on('onserverupdate', on_serverupdate_recieved);
      //Handle when we connect to the server, showing state and storing id's.
      this.socket.on('onconnected', on_connected);
      //On error we just show that we are not connected for now. Can print the data.
      this.socket.on('error', on_disconnect);
      //On message from the server, we parse the commands and send it to the handlers
      this.socket.on('message', on_netmessage);

  }; 

  return GameClient;
    
});
