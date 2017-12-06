"use strict";
module.exports = microsoft;
function microsoft(api, config) {
  return {
    createMachine: createMachine,
    destroyMachine: destroyMachine
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
  function apiCallbackHandler(resolve, reject) {
    return (function(error, data) {
      if (error)
        reject(error, data);
      else
        resolve(data);
    });
  }
}
microsoft.$name = 'microsoft';
microsoft.$targets = ['coreos'];

//# sourceMappingURL=../../providers/microsoft/index.js.map