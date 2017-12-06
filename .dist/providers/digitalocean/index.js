"use strict";
var $__promise_45_callback__,
    $__lodash__;
var promise = ($__promise_45_callback__ = require("promise-callback"), $__promise_45_callback__ && $__promise_45_callback__.__esModule && $__promise_45_callback__ || {default: $__promise_45_callback__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
module.exports = digitalocean;
function digitalocean(DOWrapper, credentials) {
  var status = {
    limit: undefined,
    remaining: undefined,
    resetTime: undefined,
    machineLimit: undefined
  };
  return {
    createMachine: createMachine,
    destroyMachine: destroyMachine,
    listMachines: listMachines,
    verifyAccount: verifyAccount,
    status: status,
    MAX_CONCURRENT_CALLS: 5
  };
  function createMachine(machineDescription) {
    var api = getApi(),
        $__2 = machineDescription,
        id = $__2.id,
        location = $__2.location,
        size = $__2.size,
        image = $__2.image,
        keys = $__2.keys,
        userData = $__2.userData;
    return promise(api.dropletsCreateNewDroplet.bind(api), id, location, size, image, {
      ssh_keys: keys,
      user_data: userData
    }).then(handleApiResponse, handleApiError).then((function(value) {
      var $__4,
          $__5;
      var $__3 = value,
          data = ($__4 = $__3[$traceurRuntime.toProperty(Symbol.iterator)](), ($__5 = $__4.next()).done ? void 0 : $__5.value),
          header = ($__5 = $__4.next()).done ? void 0 : $__5.value,
          response = ($__5 = $__4.next()).done ? void 0 : $__5.value,
          droplet = data.droplet,
          doIdentifier = {
            id: droplet.id,
            createdAt: droplet.created_at
          };
      return doIdentifier;
    }));
  }
  function destroyMachine(machine) {
    var api = getApi();
    return promise(api.dropletsDeleteDroplet.bind(api), machine.response.id).then(handleApiResponse).then((function(value) {
      return {success: true};
    }));
  }
  function listMachines() {
    var api = getApi();
    return promise(api.dropletsGetAll.bind(api)).then(handleApiResponse).then((function(value) {
      var $__3,
          $__6,
          $__4,
          $__5;
      var data = ($__4 = value[$traceurRuntime.toProperty(Symbol.iterator)](), ($__5 = $__4.next()).done ? void 0 : $__5.value),
          droplets = data.droplets;
      return _.reduce(droplets, (function(result, droplet) {
        var $__8 = droplet,
            id = $__8.id,
            createdAt = $__8.created_at,
            name = $__8.name,
            networks = $__8.networks,
            status = $__8.status;
        result[name] = {
          id: id,
          createdAt: createdAt,
          networks: {
            v4: _.map(networks.v4, (function(network) {
              var $__9 = network,
                  ipAddress = $__9.ip_address,
                  netmask = $__9.netmask,
                  gateway = $__9.gateway,
                  type = $__9.type;
              return {
                ipAddress: ipAddress,
                netmask: netmask,
                gateway: gateway,
                type: type
              };
            })),
            v6: networks.v6
          },
          status: status
        };
        return result;
      }), {});
    }));
  }
  function verifyAccount() {
    var api = new DOWrapper(credentials.token);
    return promise(api.account.bind(api)).then(handleApiResponse).then((function(value) {
      var $__7,
          $__3,
          $__6,
          $__4;
      var data = ($__6 = value[$traceurRuntime.toProperty(Symbol.iterator)](), ($__4 = $__6.next()).done ? void 0 : $__4.value);
      status.machineLimit = data.account.droplet_limit;
    }));
  }
  function getApi() {
    return new DOWrapper(credentials.token, 1000);
  }
  function handleApiResponse(value) {
    return new Promise((function(resolve, reject) {
      var $__2,
          $__7,
          $__3;
      var data,
          response;
      if (Array.isArray(value))
        ($__2 = value, data = ($__7 = $__2[$traceurRuntime.toProperty(Symbol.iterator)](), ($__3 = $__7.next()).done ? void 0 : $__3.value), response = ($__3 = $__7.next()).done ? void 0 : $__3.value, $__2);
      else
        data = response = value;
      response = response || data;
      var headers = response.headers || getResponseHeaders(response, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']);
      status.limit = parseInt(headers['RateLimit-Limit'] || '0');
      status.remaining = parseInt(headers['RateLimit-Remaining'] || '0');
      status.reset = new Date(parseInt(headers['RateLimit-Reset'] || '0') * 1000);
      resolve(value);
    }));
  }
  function handleApiError(value) {
    return new Promise((function(resolve, reject) {
      var $__3,
          $__6;
      var $__2 = value,
          error = $__2.error,
          args = $__2.args;
      var $__7 = args,
          data = ($__3 = $__7[$traceurRuntime.toProperty(Symbol.iterator)](), ($__6 = $__3.next()).done ? void 0 : $__6.value),
          response = ($__6 = $__3.next()).done ? void 0 : $__6.value;
      response = response || data;
      if (response.statusCode === 401) {
        reject({
          error: 'Unauthorized',
          data: data,
          response: response,
          provider: digitalocean.$name
        });
        return ;
      }
      reject({
        error: error,
        data: data,
        response: response,
        provider: digitalocean.$name
      });
    }));
  }
  function getResponseHeaders(response, headers) {
    return _.reduce(headers, (function(result, header) {
      result[header] = response.getResponseHeader(header);
      return result;
    }), {});
  }
}
digitalocean.$name = 'digitalocean';
digitalocean.$targets = ['coreos'];
digitalocean.$dashboardUrl = 'https://cloud.digitalocean.com';
digitalocean.$referralUrl = 'https://www.digitalocean.com/?refcode=4df1a6f6f727';
digitalocean.$credentialSchema = {token: {
    type: 'string',
    header: 'Personal Access Token',
    link: 'https://cloud.digitalocean.com/settings/tokens/new'
  }};

//# sourceMappingURL=../../providers/digitalocean/index.js.map