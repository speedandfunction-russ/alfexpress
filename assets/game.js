(function() {
  var myJail = Jails({
    debug: true
  });

  var TANK = {
    methods: {},
    properties: {},
    instanceProperties: {
      position: {
        left: 0,
        top: 0,
        speed: 8
      }
    },
    instanceMethods: function(self) {
      return {
        move: function(direction) {
          self.properties.position.left = self.properties.position.left || 0;
          self.properties.position.top = self.properties.position.top || 0;
          if (direction == 'left') {
            self.properties.position.left -= self.properties.position.speed;
          }
          if (direction == 'right') {
            self.properties.position.left += self.properties.position.speed;
          }
          if (direction == 'top') {
            self.properties.position.top -= self.properties.position.speed;
          }
          if (direction == 'bottom') {
            self.properties.position.top += self.properties.position.speed;
          }
        }
      };
    }
  };


  myJail.socketPromise.then(function() {
    var Tank = myJail.registerModel('TANK', TANK);
    Tank.on('create', function(tank) {

      function moveTank(direction, e) {

        e.preventDefault();

        tank.methods.move(direction);
        console.log(tank);
        // var request = {
        //   method: 'updateModel',
        //   data: {
        //     model: 'TANK',
        //     method: 'move',
        //     data: direction
        //   }
        // };

        // socket.send(JSON.stringify(request));

      }


      document.addEventListener("keydown", function(e) {
        if (e.keyCode == 37) {
          moveTank('left', e);
        }
        if (e.keyCode == 38) {
          moveTank('top', e);
        }
        if (e.keyCode == 39) {
          moveTank('right', e);
        }
        if (e.keyCode == 40) {
          moveTank('bottom', e);
        }
      });

      tank.on('move', function(data) {
        console.log('moving!', data);
      });
    });

    Tank.methods.create();


  });

})();