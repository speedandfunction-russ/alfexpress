const crypto = require('crypto');

module.exports = function(app) {
  // const cipher = crypto.createCipher(app.config.crypto.client, app.config.crypto.password);
  // const decipher = crypto.createDecipher(app.config.crypto.client, app.config.crypto.password);

  var cryptoModule = {};

  cryptoModule.encrypt = function(string) {
    const cipher = crypto.createCipher(app.config.crypto.client, app.config.crypto.password);
    var encrypted = cipher.update(string, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };

  cryptoModule.decrypt = function(encrypted) {
    const decipher = crypto.createDecipher(app.config.crypto.client, app.config.crypto.password);
    var decrypted = '';
    decipher.on('readable', () => {
      var data = decipher.read();
      if (data)
        decrypted += data.toString('utf8');
    });
    decipher.on('end', () => {
      // console.log(decrypted);
      // Prints: some clear text data
    });

    decipher.write(encrypted, 'hex');
    decipher.end();
    return decrypted;
  };
  return cryptoModule;

};