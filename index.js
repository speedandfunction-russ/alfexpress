var express = require('express');
var app = express();
var path = require("path");
var port = process.env.PORT || 3000;
var flash = require('connect-flash');

var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var passport = require('passport');
var expressSession = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var bCrypt = require('bcryptjs');

var bodyParser = require('body-parser');

var User = mongoose.model('User',{
  username: String,
  password: String,
  email: String,
  address: String
});

app.set('view engine', 'pug');

app.use(express.static('bower_components'));
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to database defined in db.js
mongoose.connect('mongodb://localhost:27017/alfresco');


// Setting up passport and session for autentication
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// passport/login.js
passport.use('login', new LocalStrategy(
  function(username, password, done) { 
    // check in mongo if a user with username exists or not
    console.log('login pass', username, password);
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+ username);
          return done(null, false, 
                {'message': 'User Not found.'});                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              {'message': 'Invalid Password'});
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
  })
);

passport.use('signup', new LocalStrategy(
  function(username, password, done) {
    var findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
 
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

// Generates hash using bCrypt
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
};

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};


// Default route
app.get('/home', isAuthenticated, function(req, res){
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
app.get('/api/:collection', isAuthenticated, function(req, res) {
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
app.post('/api/:collection', isAuthenticated, function(req, res) {
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
app.delete('/api/:collection', isAuthenticated, function(req, res) {
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

/* GET login page. */
app.get('/', function(req, res) {
  // Display the Login page with any flash message, if any
  if (req.isAuthenticated()) {
    res.redirect('/home');
  }
  res.render('index', { message: req.flash('message') });
});

/* Handle Login POST */
app.post('/login', function(req, res){
  passport.authenticate('login', function(err, user, info){
    console.log('log', err, user, info);
    if (err) { return next(err); }
    if (!user) { return res.send(info); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.send('{"message", "logged in successfully"}');
    });
  })(req, res);

});

/* Handle Logout */
app.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});


/* GET Registration Page */
app.get('/signup', function(req, res){
  res.render('register',{message: req.flash('message')});
});

/* Handle Registration POST */
app.post('/signup', function(req, res){
  passport.authenticate('signup', function(err, user, info){
    console.log('log', err, user, info);
    if (err) { return next(err); }
    if (!user) { return res.send(info); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/home');
    });
  })(req, res);

});




app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});