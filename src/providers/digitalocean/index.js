module.exports = digitalocean;


function digitalocean(DOWrapper, config) {
  const status = {
    limit: undefined,
    remaining: undefined,
    resetTime: undefined
  };

  return {
    createMachine,
    destroyMachine,

    verifyAccount,

    status
  };

  function createMachine(machineDescription) {
    return new Promise((resolve, reject) => {
      var api = new DOWrapper(config.token);

      var {id, location, size, image, keys, userData} = machineDescription;
      api.dropletsCreateNewDroplet(id, location, size, image, {ssh_keys: keys, user_data: userData}, apiCallbackHandler(resolve, reject));
    });
  }

  function destroyMachine(machine) {
    return new Promise((resolve, reject) => {
      var api = new DOWrapper(config.token);

      api.dropletsDeleteDroplet(machine.response.droplet.id, apiCallbackHandler(resolve, reject));
    });
  }

  function verifyAccount() {
    return new Promise((resolve, reject) => {
      const api = new DOWrapper(config.token);

      api.account(apiCallbackHandler(resolve, reject));
    });
  }

  function apiCallbackHandler(resolve, reject) {
    return (error, data, response) => {
      console.log(response);
      response = response || data;

      if (response.statusCode === 401) {
        reject('Unauthorized', data);
        return;
      }

      const headers = response.headers || response.getAllResponseHeaders();

      status.limit = headers['RateLimit-Limit'];
      status.remaining = headers['RateLimit-Remaining'];
      status.reset = headers['RateLimit-Reset'];

      if (error) reject(error, data, response);
      else resolve(data, headers);
    };
  }
}

digitalocean.$name = 'digitalocean';
digitalocean.$targets = ['coreos'];
digitalocean.$credentialSchema = {
  token: {
    type: 'string',
    header: 'Access Token'
  }
};