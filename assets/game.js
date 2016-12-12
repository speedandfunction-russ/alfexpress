(function() {

  var MODELS = {
    CHAT: {
      data: {
        messages: []
      },
      addMessage: function(params) {
        MODELS.CHAT.data.messages.push({
          user: params.user,
          message: params.message
        })
      }
    },
    TANK: {
      data: {
        position: {
          left: 0,
          top: 0,
          speed: 8
        }
      },
      move: function(direction) {
        MODELS.TANK.data.position.left = MODELS.TANK.data.position.left || 0;
        MODELS.TANK.data.position.top = MODELS.TANK.data.position.top || 0;
        if (direction == 'left') {
          MODELS.TANK.data.position.left -= MODELS.TANK.data.position.speed;
        }
        if (direction == 'right') {
          MODELS.TANK.data.position.left += MODELS.TANK.data.position.speed;
        }
        if (direction == 'top') {
          MODELS.TANK.data.position.top -= MODELS.TANK.data.position.speed;
        }
        if (direction == 'bottom') {
          MODELS.TANK.data.position.top += MODELS.TANK.data.position.speed;
        }
      }
    }
  };

  var EVENTS = {
    CHAT: [
      {
        method: 'addMessage',
        function: function(message) {
          console.log('upd chat', message);
          $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
        }
      },
      {
        method: 'getModel',
        function: function(data) {
          $('.chat').html('');
          data.messages.forEach(function(message) {
            $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
          });     
        }
      }
    ],
    TANK: [
      {
        method: 'move',
        function(direction) {
          console.log(MODELS.TANK.data);
          $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});
        }
      },
      {
        method: 'getModel',
        function: function(data) {
          MODELS.TANK.data = data; 
          $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});   
        }
      }
    ]
  };


  // WSAPI
  $(function() {

    //-------- CORE -------//
    var socket = new WebSocket("ws://localhost:8001");

    socket.onmessage = function(event) {
      console.log('came!', event.data);
      var response = JSON.parse(event.data),
        method = response.method,
        data = response.data;

      if (method === 'updateModel') {
        var request = data,
          modelMethod = request.method,
          model = MODELS[request.model],
          modelData = request.data,
          events = EVENTS[request.model] || [];

        model[modelMethod](modelData);

        events.forEach(function(event) {
          if (event.method == modelMethod) {
            event.function(modelData);
          }
        });
      }
      if (method === 'getModel') {
        var request = data,
          model = MODELS[request.model],
          modelData = request.data,
          events = EVENTS[request.model] || [];

        model.data = modelData;

        events.forEach(function(event) {
          if (event.method == 'getModel') {
            event.function(modelData);
          }
        });

      }
    };
    //---------- CORE END ------------//



    // Call getModel to get initial data of the model. Could be moved to a separate funciton with models list
    socket.onopen = function() {
      var request = {
        method: 'getModel',
        data: {
          model: 'CHAT'
        }
      };

      socket.send(JSON.stringify(request));

      request = {
        method: 'getModel',
        data: {
          model: 'TANK'
        }
      };

      socket.send(JSON.stringify(request));

    };


    // Custom calls. Should use method 'updateModel'. It will set changes and broadcast updates
    $('#chat_form').on('submit', function() {
      var request = {
        method: 'updateModel',
        data: {
          model: 'CHAT',
          method: 'addMessage',
          data: {
            user: $('#username').val(),
            message: $('#message').val()
          }
        }
      };

      socket.send(JSON.stringify(request));
      $('#message').val('');

      return false;
    });




    function moveFigure(direction, e) {

      e.preventDefault();

      var request = {
        method: 'updateModel',
        data: {
          model: 'TANK',
          method: 'move',
          data: direction
        }
      };

      socket.send(JSON.stringify(request));

    }

    // document.addEventListener("keyup", function(e) {
    //   if (e.keyCode == 32) {
    //   var $tank = $('.tank').first();
    //   var tankPosition = $tank.offset();
    //   var $bullet = $('<div class="bullet" style="left:' + (tankPosition.left + 300) + 'px;top: ' + (tankPosition.top + 40) + 'px;"></div>');
    //     $('body').append($bullet);
    //     $bullet.animate({'left': castlePosition + 'px'}, 4000, function(){
    //       explode($bullet);
    //     });
    //   }
    // });
    // document.addEventListener("keyup", function(e) {
    //   if (e.keyCode == 192) { // tab
    //     if (currentFigure === '.tank') {
    //       currentFigure = '.plane';
    //     } else {
    //       currentFigure = '.tank';
    //     }
    //   }
    // });
    // document.addEventListener("keydown", function(e) {
    //   if (e.keyCode == 13) {
    //   var $tank = $('.tank').first();
    //   var tankPosition = $tank.offset();
    //   var $bulletSmall = $('<div class="bullet bullet_small" style="left:' + (tankPosition.left + 220) + 'px;top: ' + (tankPosition.top + 18) + 'px;"></div>');
    //     $('body').append($bulletSmall);
    //     $bulletSmall.animate({'left': castlePosition + 'px'}, 2000, function(){
    //       explode($bulletSmall);
    //     });
    //   }
    // });
    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 37) {
        moveFigure('left', e);
      }
      if (e.keyCode == 38) {
        moveFigure('top', e);
      }
      if (e.keyCode == 39) {
        moveFigure('right', e);
      }
      if (e.keyCode == 40) {
        moveFigure('bottom', e);
      }
    });


    // document.addEventListener("keydown", function(e) {
    //   if (e.keyCode == 49) {
    //   var $plane = $('.plane').first();
    //   var planePosition = $plane.offset();
    //   var $laser1 = $('<div class="laser" style="left:' + (planePosition.left + 52) + 'px;top: ' + (planePosition.top - 62) + 'px;"></div>');
    //   var $laser2 = $('<div class="laser" style="left:' + (planePosition.left + 52) + 'px;top: ' + (planePosition.top + 100) + 'px;"></div>');
    //     $('body').append($laser1);
    //     $('body').append($laser2);
    //   $laser1.animate({'width': '100%', opacity: 0}, 100, function(){
    //       $laser1.remove();
    //       moveCastle();
    //     });

    //   $laser2.animate({'width': '100%', opacity: 0}, 100, function(){
    //       $laser2.remove();
    //     });

    //   }
    // });

    // $('.tank__button').on('click', function(){
    //   var $tank = $('.tank')[0].outerHTML;
    //   $('body').append($tank);
    // });







  });

})();