/* 
Usage:

call JailsModules.chat(config) with config = {
  jail: myJail, // jails instanse object,
  chatContainer: document.getElementById('chat'), // container for messages,
  chatInput: document.getElementById('chat-input'), // field with the message,
  chatForm: document.getElementById('chat-form'), // chat form element
  chatId: 0 // specific id to load
} 
*/

(function() {

  window.JailsModules = window.JailsModules || {};
  if (!Jails) {
    console.warn('Can not register module, Jails is not found!');
  }

  window.JailsModules.chat = function(config) {
    var chatId = config.chatId || 0;
    var Chat = config.jail.loadModel('CHAT');
    Chat.on('create', function(chat) {
      setChat(chat);
    });
    Chat.on('getModel', function(chat) {
      console.log('getting chat', chat);
      if (chat.id === chatId) {
        setChat(chat);
      } else {
        Chat.methods.create({
          messages: []
        });
      }
    });
    function setChat(chat) {
      console.log('creating chat', chat);
      var chatHtml = '';
      chat.properties.messages.forEach(function(params) {
        chatHtml = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + chatHtml;
      });
      config.chatContainer.innerHTML = chatHtml;
      config.chatForm.onsubmit = function() {
        chat.methods.addMessage({
          message: config.chatInput.value,
          user: config.jail.user
        });
        config.chatInput.value = '';
        return false;
      };
      chat.on('addMessage', function(params) {
        config.chatContainer.innerHTML = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + config.chatContainer.innerHTML;
      });

    }

    Chat.methods.getModel({id: chatId});

  };

})();