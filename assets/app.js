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
  }
};

var EVENTS = {
  CHAT: [
    {
      method: 'addMessage',
      function: function(message) {
        $('.flash').append('<p>' + JSON.stringify(message) + '</p>');
      }
    },
    {
      method: 'getModel',
      function: function(data) {
        $('.flash').html('');
        data.messages.forEach(function(message) {
          $('.flash').append('<p>' + JSON.stringify(message) + '</p>');
        });     
      }
    }
  ]
};

$(function(){

  $('.form-signin').on('submit', function(){
    $.post( "/login", {username: $('#username').val(), password: $('#password').val()}).done(function( data ) {
      document.location.href = "/nard";
    });

    return false;
  });


  $('#data_form').on('submit', function(){
    return false;
  });


  $('#data_form [data-method]').on('click', function(){
    var method = $(this).data('method');
    
    if (method === 'GET') {
      $.get( "/api/" + $('#collection').val() + "?data=" + encodeURI($('#data').val() || "{}")).done(function( data ) {
        $( ".flash" ).removeClass('hidden').html( JSON.stringify(data).replace(/(",")|(},{)/g, ",<br>") );
      });
    } else {
      $.ajax({
        method: method,
        url: "/api/" + $('#collection').val(),
        data: {data: $('#data').val()}
      })
      .done(function( data ) {
        if (data.length === 0) {
          $( ".flash" ).removeClass('hidden').html( "Items were removed" );
        }
      });

      
    }

  });

  if ($('#chat_form').length > 0) {
    var socket = new WebSocket("ws://localhost:8001");
    $('.flash').removeClass('hidden');

    socket.onmessage = function(event) {
      console.log('came!', event.data);
      var response = JSON.parse(event.data),
        method = response.method,
        data = response.data;


      if (method === 'update') {
        $('.flash').append('<p>' + JSON.stringify(data) + '</p>');
      }

      if (method === 'updateModel') {
        var request = data,
          modelMethod = request.method,
          model = MODELS[request.model],
          modelData = request.data,
          events = EVENTS[request.model];

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
          events = EVENTS[request.model];

        model.data = modelData;

        events.forEach(function(event) {
          if (event.method == 'getModel') {
            event.function(modelData);
          }
        });

      }
    };

    socket.onopen = function() {
      var request = {
        method: 'getModel',
        data: {
          model: 'CHAT'
        }
      };

      socket.send(JSON.stringify(request));

    };

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

    $('#synch').on('click', function(e){
      e.preventDefault();
      var request = {
        method: 'getModel',
        data: {
          model: 'CHAT'
        }
      };

      socket.send(JSON.stringify(request));

    });
    // $('#chat_form').on('submit', function() {
    //   var request = {
    //     method: 'update',
    //     data: {
    //       path: ['chat'],
    //       value: $('#message').val()
    //     }
    //   }
    //   socket.send(JSON.stringify(request));
    //   $('#message').val('');

    //   return false;
    // });
  }

});