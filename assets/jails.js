(function() {
  'use strict';

  if (Jails && typeof Jails === 'function') {
    console.warn('Jails was already inited');
    return;
  }

  Jails = function(config) {
    var JAILS = {
      models: {}, // Stores model constructors
      modelInstances: {}, // Stores all model instances in format "modelName" + id
      index: {}, // Stores array of model ids in format modelName: [1, 2, ..., id]
      events: {
        // CHAT: [
        //   {
        //     method: 'addMessage',
        //     function: function(message) {
        //       console.log('upd chat', message);
        //       $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
        //     }
        //   },
        //   {
        //     method: 'getModel',
        //     function: function(data) {
        //       $('.chat').html('');
        //       data.messages.forEach(function(message) {
        //         $('.chat').append('<p><strong>' + message.user + ':&nbsp;</strong><span>' + message.message + '</span></p>');
        //       });     
        //     }
        //   }
        // ],
        // TANK: [
        //   {
        //     method: 'move',
        //     function(direction) {
        //       console.log(MODELS.TANK.data);
        //       $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});
        //     }
        //   },
        //   {
        //     method: 'getModel',
        //     function: function(data) {
        //       MODELS.TANK.data = data; 
        //       $('#tank1').css({left: MODELS.TANK.data.position.left, top: MODELS.TANK.data.position.top});   
        //     }
        //   }
        // ]
      } // Events on callback for ws methods
    };

    function log(message) {
      if (config.debug) {
        console.log(message);
      }
    }

    function warn(message) {
      if (config.debug) {
        console.warn(message);
      }
    }

    function error(message) {
      if (config.debug) {
        console.error(message);
      }
    }

    JAILS.addInstanceMethods = function(modelName, model) {
      if (JAILS[modelName])
      return Object.assign(JAILS[modelName].instanceMethods, model);
    };

    JAILS.registerModel = function(modelName, data) {
      var defaults = {
        create: function(data) {

        },
        update: function(data) {},
        delete: function(data) {},
        find: function(data) {}
      },
      instanceMethods = MODELS[modelName];

      // Exit if model already exists
      if (JAILS.models[modelName]) {
        console.warn('Model ' + model + ' already exists! Make sure you use unique names for models');
        return;
      }

      JAILS.models[modelName] = defaults;
      JAILS.models[modelName].instanceMethods = MODELS[modelName];

    };


    JAILS.ws = new WebSocket("ws://localhost:8001");

    JAILS.ws.onmessage = function(event) {
      log('came!', event.data);
      var response = JSON.parse(event.data),
        method = response.method,
        data = response.data;

      if (method === 'updateModel') {
        var request = data,
          modelMethod = request.method,
          model = JAILS.modelInstances[request.model],
          modelData = request.data,
          events = JAILS.events[request.model] || [];

        model[modelMethod](modelData);

        events.forEach(function(event) {
          if (event.method == modelMethod) {
            event.function(modelData);
          }
        });
      }
      if (method === 'getModel') {
        var request = data,
          model = JAILS.models[request.model],
          modelData = request.data,
          events = JAILS.events[request.model] || [];

        model.data = modelData;

        events.forEach(function(event) {
          if (event.method == 'getModel') {
            event.function(modelData);
          }
        });

      }
    };


    return JAILS;
  };
})();

/*
    socket.onopen = function() {
      var request = {
        method: 'getModel',
        data: {
          model: 'CHAT'
        }
      };

      socket.send(JSON.stringify(request));

      request = {
        method: 'getModel',
        data: {
          model: 'TANK'
        }
      };

      socket.send(JSON.stringify(request));

    };
*/