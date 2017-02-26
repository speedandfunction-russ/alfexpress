function getRandomInt(min, max) {
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min)) + min;
}


(function() {
  var myJail = Jails({
    debug: true
  });

  function setupGameboard() {
    var nardGameId = nardGameId || 0;
    var NardGame = myJail.loadModel('NARD_GAME');

    // Set chat from module. TODO: move module to global Jails object
    JailsModules.chat({
      jail: myJail, // jails instanse object,
      chatContainer: document.getElementById('chat'), // container for messages,
      chatInput: document.getElementById('message'), // field with the message,
      chatForm: document.getElementById('chat_form') // chat form element
    });

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
      nardGame.methods.reset({});
      nardGame.on('move', function(params) {
      });

    }

    NardGame.methods.getModel({id: nardGameId});

  }

  myJail.on('getIndex', setupGameboard);

  myJail.getIndex();
  
})();