import promise from 'promise-callback';
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

    listMachines,

    verifyAccount,

    status,

    MAX_CONCURRENT_CALLS: 5
  };

  function createMachine(machineDescription) {
    const api = getApi(),
          {id, location, size, image, keys, userData} = machineDescription;

    return promise(
      api.dropletsCreateNewDroplet.bind(api),
      id, location, size, image, {ssh_keys: keys, user_data: userData}
    )
    .then(handleApiResponse, handleApiError)
    .then(value => {
      const [data, header, response] = value,
            {droplet} = data,
            doIdentifier = {
              id: droplet.id,
              createdAt: droplet.created_at
            };

      return doIdentifier;
    });
  }

  function destroyMachine(machine) {
    var api = getApi();

    return promise(
      api.dropletsDeleteDroplet.bind(api),
      machine.response.id
    )
    .then(handleApiResponse)
    .then(value => {
      return {success: true};
    });
  }

  function listMachines() {
    const api = getApi();

    return promise(
      api.dropletsGetAll.bind(api)
    )
    .then(handleApiResponse)
    .then(value => {
      const [data] = value,
            {droplets} = data;

      return _.reduce(droplets, (result, droplet) => {
        const {created_at: createdAt, name, networks, status} = droplet;

        result[name] = {
          createdAt,
          networks,
          status
        };

        return result;
      }, {});
    });
  }

  function verifyAccount() {
    const api = new DOWrapper(credentials.token);

    return promise(
      api.account.bind(api)
    )
    .then(handleApiResponse)
    .then(value => {
      const [data] = value;

      status.machineLimit = data.account.droplet_limit;
    });
    // return new Promise((resolve, reject) => {
    //   const api = new DOWrapper(credentials.token);

    //   api.account(apiCallbackHandler(resolve, reject, data => {
    //     status.machineLimit = data.account.droplet_limit;
    //   }));
    // });
  }

  function getApi() {
    return new DOWrapper(credentials.token, 1000);
  }

  function handleApiResponse(value) {
    return new Promise((resolve, reject) => {
      let data, response;

      if (Array.isArray(value)) [data, response] = value;
      else data = response = value;

      response = response || data;

      const headers = response.headers || getResponseHeaders(response, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']);

      status.limit = parseInt(headers['RateLimit-Limit'] || '0');
      status.remaining = parseInt(headers['RateLimit-Remaining'] || '0');
      status.reset = new Date(parseInt(headers['RateLimit-Reset'] || '0') * 1000);

      resolve(value);
    });
  }

  function handleApiError(value) {
    return new Promise((resolve, reject) => {
      const {error, args} = value;
      let [data, response] = args;

      response = response || data;

      if (response.statusCode === 401) {
        reject({error: 'Unauthorized', data, response, provider: digitalocean.$name});
        return;
      }
      reject({error, data, response, provider: digitalocean.$name});
    });
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