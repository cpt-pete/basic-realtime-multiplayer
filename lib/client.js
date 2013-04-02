/*global 
    require: true 
*/

require(["delta-timer"], function(DeltaTimer) {

    'use strict';

    var dt = new DeltaTimer(100, function(){
      console.log(this.delta);
    });

    
});
