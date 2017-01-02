module.exports = function(app) {
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
}