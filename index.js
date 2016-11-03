var express = require('express');
var app = express();
app.modules = {};
app.modules.auth = require('./modules/authorization.js')(app);
app.modules.dbapi = require('./modules/dbapi.js')(app);
app.modules.wsapi = require('./modules/wsapi.js')(app);
// var path = require("path");
var port = process.env.PORT || 3000;

app.set('view engine', 'pug');

app.use(express.static('bower_components'));
app.use(express.static('assets'));


app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});