var config = {
  dev: {
    crypto: {
      client: 'aes192',
      password: 'some password'
    },
    JAILS: {
      ws: 'ws://localhost:8001/ws'
    }
  },
  staging: {
    crypto: {
      client: 'aes192',
      password: 'some password'
    },
    JAILS: {
      ws: 'ws://ec2-35-161-224-83.us-west-2.compute.amazonaws.com/ws'
    }
  }
}

module.exports = function(app) {
  var env = 'dev';

  // Stab env into all sources
  config[env].env = env;
  config[env].JAILS.env = env;

  return config[env];
};