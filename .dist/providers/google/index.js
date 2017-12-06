"use strict";
module.exports = google;
function google(api, config) {
  var status = {};
  return {
    createMachine: createMachine,
    destroyMachine: destroyMachine,
    verifyAccount: verifyAccount,
    status: status
  };
  function createMachine(machineDescription) {
    return new Promise((function(resolve, reject) {
      var api = new api(config.token),
          $__0 = machineDescription,
          id = $__0.id,
          location = $__0.location,
          size = $__0.size,
          image = $__0.image,
          keys = $__0.keys,
          userData = $__0.userData;
    }));
  }
  function destroyMachine(machine) {
    return new Promise((function(resolve, reject) {
      var api = new api(config.token);
    }));
  }
  function verifyAccount() {
    return new Promise((function(resolve, reject) {
      resolve();
    }));
  }
  function apiCallbackHandler(resolve, reject) {
    return (function(error, data) {
      if (error)
        reject(error, data);
      else
        resolve(data);
    });
  }
}
google.$name = 'google';
google.$targets = ['coreos'];
google.$credentialSchema = {
  project: {
    type: 'string',
    header: 'Project Name (must already exist)'
  },
  account: {
    type: 'string',
    header: 'Account'
  }
};

//# sourceMappingURL=../../providers/google/index.js.map