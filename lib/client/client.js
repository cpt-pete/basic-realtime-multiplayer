/*global 
    define, require: true 
*/

define(function () {

    'use strict';

    function Client(io){
      this.connect(io);
    }

    var proto = Client.prototype;

    proto.connect = function (io) {
        
      //Store a local reference to our connection to the server
      this.socket = io.connect();
console.log(io);
      //When we connect, we are not 'connected' until we have a server id
      //and are placed in a game by the server. The server sends us a message for that.
      this.socket.on('connect', function(){
        //this.players.self.state = 'connecting';
      }.bind(this));

      //Sent when we are disconnected (network, server down, etc)
      this.socket.on('disconnect', this.client_ondisconnect.bind(this));
      //Sent each tick of the server simulation. This is our authoritive update
      this.socket.on('onserverupdate', this.client_onserverupdate_recieved.bind(this));
      //Handle when we connect to the server, showing state and storing id's.
      this.socket.on('onconnected', this.client_onconnected.bind(this));
      //On error we just show that we are not connected for now. Can print the data.
      this.socket.on('error', this.client_ondisconnect.bind(this));
      //On message from the server, we parse the commands and send it to the handlers
      this.socket.on('message', this.client_onnetmessage.bind(this));

  }; 

  return Client;
    
});
