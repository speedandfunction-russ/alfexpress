/* SAMPLE MODEL
* Should have following properties:
* methods - additional model methods
* properties - global model properties
* instanceMethods - methods for each modal instance
* instanceProperties - default instance properties
*
*/
module.exports = {
  methods: {},
  properties: {},
  instanceProperties: {},
  instanceMethods: function(self) {
    return {
      reset: function() {
        for (var i = 1; i <= 12; i++) {
          self.properties['slotA' + i] = {
            color: "",
            items: 0
          };
          self.properties['slotB' + i] = {
            color: "",
            items: 0
          };
        }
        self.properties['slotA1'] = {
          color: "white",
          items: 15
        };
        self.properties['slotB1'] = {
          color: "black",
          items: 15
        };
        self.properties.log = [];
        self.properties.cube = [1, 1];
      },
      move: function(slotStart, slotEnd, userColor) {
        var colorStart = self.properties[slotStart].color,
          colorEnd = self.properties[slotEnd].color;

        if (userColor !== colorStart) {
          return 'Can not move opposite color items or slot you are trying to use is empty';
        }

        if (colorEnd === '' || colorEnd === colorStart) {
          self.properties.log.push(colorStart + ' move from ' + slotStart + ' to ' + slotEnd);
          self.properties[slotStart].items -= 1;
          self.properties[slotEnd].items += 1;

          if (self.properties[slotEnd].items === 1) {
            self.properties[slotEnd].color = colorStart;
          }

          if (self.properties[slotStart].items === 0) {
            self.properties[slotStart].color = "";
          }
        } else {
          return 'Invalid move. You can not put items on opposite color';
        }
      },
      roll: function(n, j) {
        self.properties.log.push('roll ' + n + '-' + j);
      }
    };
  }
}