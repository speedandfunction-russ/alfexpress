// requires:
// authorization module

var ws = require("nodejs-websocket");
 var cookieParser = require('cookie-parser')
// Scream server example: "hi" -> "HI!!!" 
var broadcast = function (server, msg) {
  server.connections.forEach(function (conn) {
      conn.sendText(msg);
  });
}

var setConnectionName = function(conn) {

};


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
          conn.username = str;
          broadcast(server, conn.user + ':' + str);
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