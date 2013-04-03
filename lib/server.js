/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./server/web-server', './server/socket-server'], function ( webserver, socketserver) {

  'use strict'; 

   var server = webserver(8080);
   var sio = socketserver(server);




});


