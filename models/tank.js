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
}