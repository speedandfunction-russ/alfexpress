// requires:
// authorization module

var ws = require("nodejs-websocket");
 var cookieParser = require('cookie-parser')
// Scream server example: "hi" -> "HI!!!" 
var broadcast = function (server, msg) {
  server.connections.forEach(function (conn) {
      conn.sendText(msg);
  });
};

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

var setConnectionName = function(conn) {

};

var METHODS = {
  broadcast: function(params) {
    broadcast(params.server, params.connection.user + ':' + params.data);
  },
  update: function(params) {
    var server = params.server,
      request = params.data,
      path = request.path,
      newData = request.value,
      obj = DATA;

    console.log('starting update', params.data);
    for (var i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        obj[path[i]] = newData;
        broadcast(server, '{"method":"update", "data":' + JSON.stringify(DATA) + '}');
      } else {
        if (!obj.hasOwnProperty(path[i])) {
          obj[path[i]] = {};
        }
        obj = obj[path[i]];
      }
    }
  },
  updateModel: function(params) {
    var request = params.data,
      server = params.server,
      method = request.method,
      model = MODELS[request.model],
      data = request.data;

    model[method](data);

    broadcast(server, '{"method":"updateModel", "data":' + JSON.stringify(request) + '}');
  },
  getModel: function(params) {
    var request = params.data,
      server = params.server,
      model = MODELS[request.model],
      connection = params.connection,
      response = {
        model: request.model,
        data: model.data
      };

    connection.sendText('{"method":"getModel", "data":' + JSON.stringify(response) + '}');
  }
}


module.exports = function(app) {

  var server = ws.createServer(function (conn) {
      try {
        var cookie = conn.headers.cookie.match(/; wsconnection=(.*)(;|$)/)[1];
        var session = app.modules.crypto.decrypt(cookie);
      } catch (e) {
        console.log('error creating connection session', e);
        conn.close(401, 'Couldn\'t identify session');
        return false;
      }
      conn.session = cookie;
      conn.user = session.split(':')[0];
      conn.sessionStart = session.split(':')[1];

      conn.on("text", function (str) {
          console.log("Received "+str);

          var request = JSON.parse(str);
          var method = request.method;
          var data = request.data;

          METHODS[method]({
            data: data,
            connection: conn,
            server: server
          });
      });
      conn.on("close", function (code, reason) {
          console.log("Connection closed")
      });
      conn.on("error", function (error) {
          console.log("error", error);
      });
  }).listen(8001)

  app.get('/chat', app.modules.auth.isAuthenticated, function(req, res){
    var encr = app.modules.crypto.encrypt(req.user.username + ':' + new Date().getTime());
    res.cookie('wsconnection', encr);
    res.render('chat', {
      user: req.user.username,
      ip: req.connection.remoteAddress
    });
  });

  app.get('/chat/session', app.modules.auth.isAuthenticated, function(req, res){
    var encr = app.modules.crypto.encrypt(req.user.username + ':' + new Date().getTime());
    res.cookie('wsconnection', encr);
    // res.setHeaders('Cookie', 'wsconnection=' + app.encrypt(user.username) + new Date().getTime());
    res.render('chat', {
      user: req.user.username
    });
  });


  return {
    server: server,
    broadcast: broadcast
  }
};