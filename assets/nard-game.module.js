/* 
Usage:

call JailsModules.nardGame(config) with config = {
  jail: myJail, // jails instanse object,
  id: 0 // game id
} 
*/

(function() {

  window.JailsModules = window.JailsModules || {};
  if (!Jails) {
    console.warn('Can not register module, Jails is not found!');
  }

  window.JailsModules.nardGame = function(config) {
    var nardGameId = config.id || 0;
    var NardGame = config.jail.loadModel('NARD_GAME');
    NardGame.on('create', function(nardGame) {
      setNardGame(nardGame);
    });
    NardGame.on('getModel', function(nardGame) {
      console.log('getting nardGame', nardGame);
      if (nardGame.id === nardGameId) {
        setNardGame(nardGame);
      } else {
        NardGame.methods.create();
      }
    });
    function setNardGame(nardGame) {
      console.log('creating nardGame', nardGame);
      var nardGameHtml = '';
      nardGame.properties.messages.forEach(function(params) {
        nardGameHtml = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + nardGameHtml;
      });
      config.nardGameContainer.innerHTML = nardGameHtml;
      config.nardGameForm.onsubmit = function() {
        nardGame.methods.addMessage({
          message: config.nardGameInput.value,
          user: config.jail.user
        });
        config.nardGameInput.value = '';
        return false;
      };
      nardGame.on('addMessage', function(params) {
        config.nardGameContainer.innerHTML = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + config.nardGameContainer.innerHTML;
      });

    }

    NardGame.methods.getModel({id: nardGameId});

  };

})();