// requires:
// authorization module
module.exports = function(app) {

  var MongoClient = require('mongodb').MongoClient;

  var ws = require('nodejs-websocket');
   var cookieParser = require('cookie-parser')
  // Scream server example: "hi" -> "HI!!!" 
  var broadcast = function (server, msg) {
    server.connections.forEach(function (conn) {
        conn.sendText(msg);
    });
  };

  var TANK = require('../models/tank.js');

  var JAILS = {
    models: {}, // Stores model constructors
    modelInstances: {}, // Stores all model instances in format "modelName" + id
    index: {} // Stores array of model ids in format modelName: [1, 2, ..., id]
  };

  JAILS.registerModel = function(modelName, data) {
    var defaults = function(modelName) {
        return {
          create: function(data) {
            var lastId, id, dataKeys;

            data = data || {};
            dataKeys = Object.keys(data);

            if (!Array.isArray(JAILS.index[modelName])) { // Set model index to array if it wasn't
              JAILS.index[modelName] = [];
            }

            if (JAILS.index[modelName].length > 0) {
              lastId = JAILS.index[modelName][JAILS.index[modelName].length - 1]; // last item in index
              currentId = lastId + 1;
            } else {
              id = 0;
            }

            JAILS.modelInstances[modelName + id] = {
              id: id
            };

            JAILS.modelInstances[modelName + id].methods = JAILS.models[modelName].instanceMethods(JAILS.modelInstances[modelName + id]);
            JAILS.modelInstances[modelName + id].properties = JAILS.models[modelName].instanceProperties; // setting default properties

            dataKeys.forEach(function(key) { // overwriting default properties with ones from data for create
              JAILS.modelInstances[modelName + id].properties[key] = data[key];
            });

            return JAILS.modelInstances[modelName + id];
          },
          update: function(data) {},
          delete: function(data) {},
          find: function(data) {}
        };
      },
      defaultKeys = Object.keys(defaults);

    // Exit if model already exists
    if (JAILS.models[modelName]) {
      console.warn('Model ' + model + ' already exists! Make sure you use unique names for models');
      return;
    }

    JAILS.models[modelName] = data;
    JAILS.models[modelName].methods = defaults(modelName);

    // defaultKeys.forEach(function(key) { // setting default Model methods;

    //   if (!JAILS.models[modelName].methods.hasOwnProperty(key)) { // no key in model methods, adding default;
    //     JAILS.models[modelName].methods[key] = defaults.key;
    //   } else {
    //     console.warn('Careful! Overwritten default method ' + key + ' for ' + modelName);
    //   }

    // });  

  };

  JAILS.registerModel('TANK', TANK);


  var setConnectionName = function(conn) {

  };

  var syncToDb = function(interval) {
    var models = Object.keys(JAILS.models),
      THIS = {};
    models.forEach(function(model) {

      MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
        if (err) {
          throw err;
        }

        function set() {
          console.log('mod data', JAILS.models[model].data);
          db.collection('models').update({name: model}, {
            $set: {
              data: JAILS.models[model].data
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
    var models = Object.keys(JAILS.models);
    models.forEach(function(model) {
      MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
        db.collection('models').find({name: model}).toArray(function(err, result) {
          console.log('syncFromDb', result);
          JAILS.models[model].data = result[0].data;
          console.log('updating model object', model, JSON.stringify(result));
          db.close();
        });   
      });
    });
  };

  // Is not supported. May require update
  var createMissingDocuments = function() {
    var models = Object.keys(JAILS.models),
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
              data: JAILS.models[model].data
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
    var models = Object.keys(JAILS.models);

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
        model = JAILS.modelInstances[request.model],
        data = request.data;

      model.methods[method](data);

      broadcast(server, '{"method":"updateModel", "data":' + JSON.stringify(request) + '}');
    },
    getModel: function(params) {
      var request = params.data,
        server = params.server,
        model = JAILS.modelInstances[request.model],
        connection = params.connection,
        response = {
          model: request.model,
          data: model ? model.data : 'no model found!'
        };

      connection.sendText('{"method":"getModel", "data":' + JSON.stringify(response) + '}');
    },
    getIndex: function(params) {
      var request = params.data,
        server = params.server,
        index = JAILS.index,
        connection = params.connection,
        response = {
          index: index
        };

      connection.sendText('{"method":"getModel", "data":' + JSON.stringify(response) + '}');
    },
    create: function(params) {
      console.log('j', JAILS.models, params.data.model);
      var request = params.data,
        server = params.server,
        model = JAILS.models[request.model],
        properties = request.data,
        connection = params.connection,
        response = {
          model: request.model,
          properties: request.data,
          data: model.methods.create(properties) // Create new model and return its content
        };
      console.log('broadcasting', '{"method":"create", "data":' + JSON.stringify(response) + '}');
      broadcast(server, '{"method":"create", "data":' + JSON.stringify(response) + '}');
    }
  }



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
          console.log('meth', method);
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

  app.get('/models.js', app.modules.auth.isAuthenticated, function(req, res){
    res.send('JAILS.models = ');
  });

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