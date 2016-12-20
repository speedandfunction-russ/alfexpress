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
}