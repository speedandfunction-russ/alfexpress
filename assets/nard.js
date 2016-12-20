(function() {
  var slotsNum = 24,
    nardsNum = 15,
    myJail = Jails({
    debug: true
  });

  var boardElement = document.getElementById('board');
  var GAMEBOARD = {
    addItem: function(nard, slot) {
      var nardItem = document.getElementById('nard' + nard.id),
        slotItemsLength = GAMEBOARD['slot' + slot].length;
      if (slot < 24 / 2 + 1) {
        nardItem.style.left = (10 + (slot - 1) * 50) + 'px';
        nardItem.style.bottom = (27 * slotItemsLength + 1) + 'px';
        nardItem.style.top = 'auto';
      } else {
        nardItem.style.left = (10 + (slotsNum - slot) * 50) + 'px';
        nardItem.style.top = (27 * slotItemsLength + 1) + 'px';
        nardItem.style.bottom = 'auto';
      }

      GAMEBOARD['slot' + slot].push(nard);
    },
    removeItem: function(nard) {
      for (var i = 1; i <= slotsNum; i++) {
        if (GAMEBOARD['slot' + i][GAMEBOARD['slot' + i].length - 1] && (GAMEBOARD['slot' + i][GAMEBOARD['slot' + i].length - 1].id === nard.id)) {
          GAMEBOARD['slot' + i].pop();
        }
      }
    },
    moveItem: function(nard, slot) {
      GAMEBOARD.removeItem(nard);
      GAMEBOARD.addItem(nard, slot);
    }
  };

  for (var i = 1; i <= slotsNum; i++) {
    GAMEBOARD['slot' + i] = [];
    (function(){
      var slot = document.createElement('div'),
        slotId = i;
      slot.className = 'slot';
      if (slotId < 24 / 2 + 1) {
        slot.style.left = (10 + (slotId - 1) * 50) + 'px';
        slot.style.bottom = 0;
      } else {
        slot.style.left = (10 + (slotsNum - i) * 50) + 'px';
        slot.style.top = 0;
      }
      slot.id = 'slot' + slotId;
      boardElement.append(slot);
      slot.onclick = function() {
        if (GAMEBOARD.selectedNard && GAMEBOARD['slot' + GAMEBOARD.selectedNard.properties.position][GAMEBOARD['slot' + GAMEBOARD.selectedNard.properties.position].length - 1].id === GAMEBOARD.selectedNard.id) {
          GAMEBOARD.selectedNard.methods.move(slotId);
        } else {
          alert('Take from the top! (Beri s verhu)');
        }
      }
    })();

  }

  var NARD = {
    methods: {},
    properties: {},
    instanceProperties: {
      position: 0,
      color: 'black'
    },
    instanceMethods: function(self) {
      return {
        move: function(position) {
          self.properties.position = position;
        }
      };
    }
  };


  myJail.socketPromise.then(function() {
    var Nard = myJail.registerModel('NARD', NARD);

    function setItem(nardItem){
      var nardHtml = document.createElement('button');
      var nard = nardItem;
      var color = nard.properties.color;
      nardHtml.className = 'nard nard_' + nard.properties.color;
      nardHtml.id = 'nard' + nard.id;
      nardHtml.nard = nard;
      boardElement.append(nardHtml);
      GAMEBOARD.addItem(nard, nard.properties.position);
      function moveNard(position) {

        e.preventDefault();

        nard.methods.move(position);

      }

      nardHtml.onclick = function() {
        GAMEBOARD.selectedNard = nard;
      };

      nard.on('move', function(slot) {
        GAMEBOARD.moveItem(nard, slot);
        console.log(GAMEBOARD);
      });

    }
    Nard.on('create', function(nard) {
      setItem(nard);
    });

    Nard.on('getModel', function(nard) {
      console.log('on getmodel');
      setItem(nard);
    });

    console.log('events', myJail.events);

    Nard.methods.getModel({id: 2});

    for (var i = 1; i <= nardsNum; i++) {
      Nard.methods.create({
        position: 1,
        color: 'black'
      });
    }

    for (var i = 1; i <= nardsNum; i++) {
      Nard.methods.create({
        position: 13,
        color: 'white'
      });
    }


  });
  window.board = GAMEBOARD;
})();