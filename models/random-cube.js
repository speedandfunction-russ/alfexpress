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
  instanceProperties: {
    number: 0,
    player: ''
  },
  instanceMethods: function(self) {
    return {
      set: function(data) {

        self.properties.player = data.player;
        self.properties.number = data.value;

      }
    };
  }
};