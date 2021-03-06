$(function(){

  $('.form-signin').on('submit', function(){
    $.post( "/login", {username: $('#username').val(), password: $('#password').val()}).done(function( data ) {
      document.location.href = "/home";
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

});