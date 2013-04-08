/*global 
    define, 
    THREEx,
    require: true 
*/

define(["./../core/game-state", "./../client/renderer", "./../core/delta-timer"],
  function (GameState, Renderer, DeltaTimer) {

    'use strict';
    
    function GameClient(io, viewportEl){      
      this.viewportEl = viewportEl;
      this.keyboard = new THREEx.KeyboardState();  

      this.connect(io);  
    }    

    GameClient.prototype = {

      start_game: function(me, others){
        
        this.state = new GameState();
        this.renderer = new Renderer(this.state, this.viewportEl);

        this.me = this.state.add_player(me);

        for(var i = 0; i < others.length; i++){
          this.state.add_player(others[i]);          
        }             

      },

      on_user_input: function(){      

          var x_dir = 0;
          var y_dir = 0;
          var input = [];
          this.client_has_input = false;

          if( this.keyboard.pressed('A') ||
              this.keyboard.pressed('left')) {

                  x_dir = -1;
                  input.push('l');

              } 

          if( this.keyboard.pressed('D') ||
              this.keyboard.pressed('right')) {

                  x_dir = 1;
                  input.push('r');

              } 

          if( this.keyboard.pressed('S') ||
              this.keyboard.pressed('down')) {

                  y_dir = 1;
                  input.push('d');

              } 

          if( this.keyboard.pressed('W') ||
              this.keyboard.pressed('up')) {

                  y_dir = -1;
                  input.push('u');

              } 

          if(input.length) {
               
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
        
          }
      },
     

      on_netmessage : function(data) {
       
      },

      on_disconnect : function(){

      },
     
      on_serverupdate_recieved : function(){

      },

      on_entered_game : function(data){   
        this.start_game(data.me, data.others);         
      },

      on_player_joined : function(data){
        this.state.add_player(data.player);                 
      },

      on_player_left : function(data){
        var player = this.state.find_player(data.playerid);
        this.state.remove_player(player);        
      },

      update : function() {
      
      },
      
      connect : function (io) {
          
        //Store a local reference to our connection to the server
        var socket = this.socket = io.connect();

        socket.on('entered-game', this.on_entered_game.bind(this));

        socket.on('player-joined', this.on_player_joined.bind(this));

        socket.on('player-left', this.on_player_left.bind(this));


       /* //Sent when we are disconnected (network, server down, etc)
        this.socket.on('disconnect', this.on_disconnect.bind(this) );
        //Sent each tick of the server simulation. This is our authoritive update
        this.socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this) );
        //Handle when we connect to the server, showing state and storing id's.
        this.socket.on('onconnected', this.on_connected.bind(this) );
        //On error we just show that we are not connected for now. Can print the data.
        this.socket.on('error', this.on_disconnect.bind(this) );
        //On message from the server, we parse the commands and send it to the handlers
        this.socket.on('message', this.on_netmessage.bind(this) );*/

    }

  };

  return GameClient;
    
});
