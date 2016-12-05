// requires:
// authorization module

var MongoClient = require('mongodb').MongoClient;

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

var setConnectionName = function(conn) {

};

var syncToDb = function(interval) {
  var models = Object.keys(MODELS),
    THIS = {};
  models.forEach(function(model) {

    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      if (err) {
        throw err;
      }

      function set() {
        console.log('mod data', MODELS[model].data);
        db.collection('models').update({name: model}, {
          $set: {
            data: MODELS[model].data
          }
        });
      }
      set();

      if (interval) {
        var int = setInterval(function() {
          set();
        }, interval);

        THIS.stop = function() {
          clearInterval(int);
          db.close();
        }        
      } else {
        THIS.stop = function() {
          console.log('WARNING! syncToDb.stop was called but the interval was not set');
        }
      }

    });
  });
  return THIS;
};

var syncFromDb = function() {
  var models = Object.keys(MODELS);
  models.forEach(function(model) {
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      db.collection('models').find({name: model}).toArray(function(err, result) {
        console.log('syncFromDb', result);
        MODELS[model].data = result[0].data;
        console.log('updating model object', model, JSON.stringify(result));
        db.close();
      });   
    });
  });
};

// Is not supported. May require update
var createMissingDocuments = function() {
  var models = Object.keys(MODELS),
    promises = [],
    THIS;
  models.forEach(function(model, i) {
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      db.collection('models').find({name: model}).toArray(function(err, result) {
        if (err) {
          throw err;
        }
        if (result.length === 0) {
          db.collection('models').insert({
            name: model,
            data: MODELS[model].data
          });
        }
        console.log(model, result);
        db.close();
      });   
    });

    // if (i === models.length - 1) {
    //   THIS.promise
    // }
  });
};

// Is not supported. May require update
var cleanDocuments = function() {
  var models = Object.keys(MODELS);

  models.forEach(function(model) {
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      db.collection('models').remove({name: model});
      db.close();
    });
  });

};


// Use syncToDb first to reset all the data to default on each start
syncFromDb();
syncToDb(2000);

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