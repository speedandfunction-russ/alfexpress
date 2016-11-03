// requires:
// authorization module

var MongoClient = require('mongodb').MongoClient;


module.exports = function(app) {
  console.log('mod', app.modules);
  // Default route
  app.get('/home', app.modules.auth.isAuthenticated, function(req, res){
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      if (err) {
        throw err;
      }
      console.log("Connected correctly to server");
      db.listCollections().toArray(function(err, collections){
        console.log('listing', collections);
        if (err) {
          throw err;
        }
        res.render('home', { user: req.user, collections: JSON.stringify(collections) });
        db.close();
      });
    });

  });


  // RESTfull get
  app.get('/api/:collection', app.modules.auth.isAuthenticated, function(req, res) {
    var query = JSON.parse(decodeURI(req.query.data));
    var collection = req.params.collection;
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      if (err) {
        throw err;
      }
      console.log("Connected correctly to server");
      db.collection(collection).find(query).toArray(function(err, result) {
        if (err) {
          throw err;
        }
        res.send(result);
        db.close();
      });
    });
  });

  // RESTfull post
  app.post('/api/:collection', app.modules.auth.isAuthenticated, function(req, res) {
    var query = JSON.parse(req.body.data);
    var collection = req.params.collection;
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      if (err) {
        throw err;
      }
      console.log("Connected correctly to server");
      db.collection(collection).insertOne(query);

      setTimeout(function() {

        db.collection(collection).find(query).toArray(function(err, result) {
          if (err) {
            throw err;
          }
          res.send(result);
          db.close();
        });
      });
    });
  });

  // RESTfull delete
  app.delete('/api/:collection', app.modules.auth.isAuthenticated, function(req, res) {
    var query = JSON.parse(req.body.data);
    var collection = req.params.collection;
    MongoClient.connect('mongodb://localhost:27017/alfresco', function(err, db) {
      if (err) {
        throw err;
      }
      console.log("Connected correctly to server");
      db.collection(collection).remove(query);

      setTimeout(function() {

        db.collection(collection).find(query).toArray(function(err, result) {
          if (err) {
            throw err;
          }
          res.send(result);
          db.close();
        });
      });
    });
  });
}

