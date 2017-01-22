function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

function updateView(el, params) {
  var textElements = document.querySelectorAll('j-bind-html');
}


(function() {
  var slotsNum = 24,
    nardsNum = 15,
    myJail = Jails({
      debug: true
    });

  var boardElement = document.getElementById('board');
  var cubeContainer = document.getElementById('cube-container');
  var playerName = document.getElementById('player');
  var chatContainer = document.getElementById('chat');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
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

  for (var i = 0; i <= slotsNum + 1; i++) {
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

  function setupGameboard() {
    var Nard = myJail.loadModel('NARD');
    var RandomCube = myJail.loadModel('RANDOM_CUBE');
    var Chat = myJail.loadModel('CHAT');

    GAMEBOARD.player = myJail.user;
    console.log('player', GAMEBOARD.player);

    function setItem(nardItem) {
      console.log('creating nard', nardItem);
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
        document.querySelectorAll('.nard.selected').forEach(function(nard) {
          var clsText = nard.className;

          var clses = clsText.split(' ');
          clses.splice(clses.indexOf('selected'), 1);

          nard.className = clses.join(' ');
        });
        this.className += ' selected';
        GAMEBOARD.selectedNard = nard;
      };

      nard.on('move', function(slot) {
        GAMEBOARD.moveItem(nard, slot);
        console.log(GAMEBOARD);
      });

    }

    function setCube(cubeItem) {
      console.log('creating cube', cubeItem);
      var cubeHtml = document.createElement('button');
      var cube = cubeItem;
      cubeHtml.innerHTML = (cube.properties.number);
      cubeHtml.id = 'cube' + cube.id;
      cubeHtml.cube = cube;
      cubeContainer.append(cubeHtml);
      playerName.innerHTML = cube.properties.player;
      GAMEBOARD.cubes = GAMEBOARD.cubes || [];
      GAMEBOARD.cubes.push(cube);
      cubeContainer.onclick = function() {
        if (GAMEBOARD.cubes[0].properties.player === GAMEBOARD.player) {
          alert('Wait for other player!');
          return false;
        }
        
        GAMEBOARD.cubes.forEach(function(cube) {
          cube.methods.set({
            value: getRandomInt(1, 6),
            player: GAMEBOARD.player
          });
        });
      };

      cube.on('set', function(data) {
        console.log('setting cube', data);

        cubeHtml.innerHTML = cube.properties.number;
        playerName.innerHTML = cube.properties.player;
      });

    }

    function setChat(chat) {
      console.log('creating chat', chat);
      var chatHtml = '';
      chat.properties.messages.forEach(function(params) {
        chatHtml = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + chatHtml;
      });
      chatContainer.innerHTML = chatHtml;
      chatForm.onsubmit = function() {
        chat.methods.addMessage({
          message: chatInput.value,
          user: GAMEBOARD.player
        });
        chatInput.value = '';
        return false;
      };

      chat.on('addMessage', function(params) {
        chatContainer.innerHTML = '<div class="message"><span class="user">' + params.user + ':</span><span class="content">' + params.message + '</span></div>' + chatContainer.innerHTML;
      });

    }

    Nard.on('create', function(nard) {
      setItem(nard);
    });

    Nard.on('getModel', function(nard) {
      setItem(nard);
    });

    RandomCube.on('create', function(cube) {
      setCube(cube);
    });

    RandomCube.on('getModel', function(cube) {
      setCube(cube);
    });

    Chat.on('create', function(chat) {
      setChat(chat);
    });

    Chat.on('getModel', function(chat) {
      setChat(chat);
    });

    function loadBoard() {
      for (var i = 0; i < 2*nardsNum; i++) {
        Nard.methods.getModel({id: i});
      }
      for (var i = 0; i < 2; i++) {
        RandomCube.methods.getModel({id: i});
      }
      Chat.methods.getModel({id: 0});
    }

    function setNewBoard() {
      for (var i = 0; i < nardsNum; i++) {
        Nard.methods.create({
          position: 1,
          color: 'black'
        });
      }

      for (var i = 0; i < nardsNum; i++) {
        Nard.methods.create({
          position: 13,
          color: 'white'
        });
      }

      for (var i = 0; i < 2; i++) {
        RandomCube.methods.create({
          number: 1,
          player: 'noone'
        });
      }
      Chat.methods.create({
        messages: []
      });
    }
    function reset() {

      for (var j = 0; j <= slotsNum; j++) {
        GAMEBOARD['slot' + j] = [];
      }

      function resetNard(id) {
        var nard = myJail.modelInstances['NARD' + id];

        if (nard.properties.color === 'white') {
          nard.methods.move(13);
        }

        if (nard.properties.color === 'black') {
          nard.methods.move(1);
        }
      }

      for (var i = 0; i < (nardsNum * 2); i++) {
        resetNard(i);
      }

      GAMEBOARD.cubes.forEach(function(cube) {
        cube.methods.set({
          value: 1,
          player: ''
        });
      });
    }
    loadBoard();
    // document.getElementById('load-board').onclick = function() {
    //   loadBoard();
    // };

    document.getElementById('new-board').onclick = function() {
      setNewBoard();
    };

    document.getElementById('reset').onclick = function() {
      reset();
    };

  }

  myJail.on('getIndex', setupGameboard);

  // myJail.on('getIndex', function() {
  //   myJail.ws.onclose = function(e) {
  //     alert('Ты отключена от сервера. Перегрузи страницу, чтобы продолжить игру' + e.code);
  //     // window.location.reload();
  //   };    
  // });

  myJail.getIndex();
  

  // myJail.socketPromise.then(function() {
  //   myJail.events.getIndex = [
  //     {
  //       function: 
  //     }
  //   ];

  // });
  // window.board = GAMEBOARD;
})();