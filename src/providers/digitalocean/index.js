import _ from 'lodash';

module.exports = digitalocean;

function digitalocean(DOWrapper, credentials) {
  const status = {
    limit: undefined,
    remaining: undefined,
    resetTime: undefined,
    machineLimit: undefined
  };

  return {
    createMachine,
    destroyMachine,

    verifyAccount,

    status,

    MAX_CONCURRENT_CALLS: 5
  };

  function createMachine(machineDescription) {
    return new Promise((resolve, reject) => {
      var api = new DOWrapper(credentials.token);

      var {id, location, size, image, keys, userData} = machineDescription;
      api.dropletsCreateNewDroplet(id, location, size, image, {ssh_keys: keys, user_data: userData}, apiCallbackHandler(resolve, reject));
    });
  }

  function destroyMachine(machine) {
    return new Promise((resolve, reject) => {
      var api = new DOWrapper(credentials.token);

      api.dropletsDeleteDroplet(machine.response.droplet.id, apiCallbackHandler(resolve, reject));
    });
  }

  function verifyAccount() {
    return new Promise((resolve, reject) => {
      console.log('credentials', credentials);
      const api = new DOWrapper(credentials.token);

      api.account(apiCallbackHandler(resolve, reject, data => {
        status.machineLimit = data.account.droplet_limit;
      }));
    });
  }

  function apiCallbackHandler(resolve, reject, hook) {
    return (error, data, response) => {
      response = response || data;

      if (response.statusCode === 401) {
        reject({error: 'Unauthorized', data, response, provider: digitalocean.$name});
        return;
      }

      const headers = response.headers || getResponseHeaders(response, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']);

      status.limit = parseInt(headers['RateLimit-Limit'] || '0');
      status.remaining = parseInt(headers['RateLimit-Remaining'] || '0');
      status.reset = new Date(parseInt(headers['RateLimit-Reset'] || '0') * 1000);

      // Not really sure we should be passing the name here
      if (error) reject({error, data, response, provider: digitalocean.$name});
      else {
        // This should really go away. Probably should promisify the entire DOWrapper
        if (hook) hook(data, headers);
        resolve(data, headers);
      }
    };
  }

  function getResponseHeaders(response, headers) {
    return _.reduce(headers, (result, header) => {
      result[header] = response.getResponseHeader(header);
      return result;
    }, {});
  }
}

digitalocean.$name = 'digitalocean';
digitalocean.$targets = ['coreos'];
digitalocean.$credentialSchema = {
  token: {
    type: 'string',
    header: 'Personal Access Token',
    link: 'https://cloud.digitalocean.com/settings/tokens/new'
  }
};