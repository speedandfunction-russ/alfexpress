// requires:
// authorization module

var ws = require("nodejs-websocket");
 
// Scream server example: "hi" -> "HI!!!" 
var broadcast = function (server, msg) {
  server.connections.forEach(function (conn) {
      conn.sendText(msg);
  });
}

var setConnectionName = function(conn) {

};

var server = ws.createServer(function (conn) {
    console.log("New connection");
    conn.on("text", function (str) {
        console.log("Received "+str);
        conn.username = str;
        broadcast(server, str);
        console.log('name', server.connections[0].username);
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(8001)


module.exports = function(app) {

  app.get('/chat', app.modules.auth.isAuthenticated, function(req, res){
    res.render('chat');
  });


  return {
    server: server,
    broadcast: broadcast
  }
};