var passport = require('passport');
var expressSession = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bodyParser = require('body-parser');



var bCrypt = require('bcryptjs');

var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var User = mongoose.model('User', {
  username: String,
  password: String,
  email: String,
  address: String
});

// Connecting to database defined in db.js
mongoose.connect('mongodb://localhost:27017/alfresco');

module.exports = function(app) {
  // Setting up passport and session for autentication
  var authModule = {};


  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressSession({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: true
  }));
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
  passport.use('getUser', new LocalStrategy(
    function(username, password, done) {
      // check in mongo if a user with username exists or not
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
          authModule.user = user;
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
               console.log('message','User Already Exists'));
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
        return res.redirect('/game');
      });
    })(req, res);

  });

  /* GET login page. */
  app.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    if (req.isAuthenticated()) {
      res.redirect('/game');
    }
    res.render('index', { message: req.flash('message') });
  });


  authModule.isAuthenticated = isAuthenticated;
  authModule.passport = passport;
  return authModule;

};