var express = require('express');
var app = express();
app.modules = {};
app.helpers = {};
app.config = require('./config.js')(app);
app.helpers.readFolder = require('./modules/read-folder.js')(app);
app.modules.crypto = require('./modules/crypto.js')(app);
app.modules.auth = require('./modules/authorization.js')(app);
app.modules.dbapi = require('./modules/dbapi.js')(app);
app.modules.wsapi = require('./modules/wsapi.js')(app);
app.modules.game = require('./modules/game.js')(app);
app.modules.nard = require('./modules/nard.js')(app);
app.modules.chat = require('./modules/chat.js')(app);
// var path = require("path");
var port = process.env.PORT || 3000;

console.log(app.config);
// var encrypted = app.modules.crypto.encrypt('hello');
// console.log('encrypted', encrypted);
// var decrypted = app.modules.crypto.decrypt(encrypted);
// console.log('decrypted', decrypted);

app.set('view engine', 'pug');

app.use(express.static('bower_components'));
app.use(express.static('assets'));
app.use(express.static('static'));
app.use('/models', express.static('views/models'))


app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});