/* SAMPLE MODEL
* Should have following properties:
* methods - additional model methods
* properties - global model properties
* instanceMethods - methods for each modal instance
* instanceProperties - default instance properties
*
*/
module.exports = {
  data: {
    messages: []
  },
  addMessage: function(params) {
    MODELS.CHAT.data.messages.push({
      user: params.user,
      message: params.message
    })
  }
}