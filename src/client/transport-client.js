/*jshint browser:true */
/*jshint -W079 */
/*global define, EventEmitter, io */

define( function () {

  'use strict'; 
  
  function Transport(){  
  }

  var proto = Transport.prototype = new EventEmitter();

  proto.connect = function(){
    this.socket = io.connect();

    this.socket.on('disconnect', function(){
     this.emitEvent('disconnect');
    }.bind(this));

    this.socket.on('event', function(data){
      this.emitEvent('event', [data]);
    }.bind(this));

    this.socket.on('onserverupdate', function(data){
      this.emitEvent('onserverupdate', [data]);
    }.bind(this));

    this.socket.on('good_move', function(data){
      this.emitEvent('good_move', [data]);
    }.bind(this));

    this.socket.on('ajust_move', function(data){
      this.emitEvent('ajust_move', [data]);
    }.bind(this));
  };

  proto.to_server = function(message, data){
    this.socket.emit( message , data );    
  }; 
  
  return Transport;

});

