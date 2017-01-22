function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min)) + min;
}


(function() {
  var myJail = Jails({
    debug: true
  });

  function setupGameboard() {
    JailsModules.chat({
      jail: myJail, // jails instanse object,
      chatContainer: document.getElementById('chat'), // container for messages,
      chatInput: document.getElementById('chat-input'), // field with the message,
      chatForm: document.getElementById('chat-form') // chat form element
    });
  }

  myJail.on('getIndex', setupGameboard);

  myJail.getIndex();
  
})();