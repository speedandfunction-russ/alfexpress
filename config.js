const config = {
  dev: {
    crypto: {
      client: 'aes192',
      password: 'some password'
    }
  }
}

module.exports = function(app) {
  return config[app.env];
};