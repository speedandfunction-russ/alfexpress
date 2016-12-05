module.exports = function(app) {
  app.get('/game', app.modules.auth.isAuthenticated, function(req, res){
    var encr = app.modules.crypto.encrypt(req.user.username + ':' + new Date().getTime());
    res.cookie('wsconnection', encr);
    res.render('game', {
      user: req.user.username,
      ip: req.connection.remoteAddress
    });
  });
};
