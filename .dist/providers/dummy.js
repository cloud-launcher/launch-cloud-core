"use strict";
module.exports = (function(config) {
  return {
    name: 'dummy',
    createMachine: createMachine,
    destroyMachine: destroyMachine
  };
  function createMachine(machineDescription) {
    return new Promise((function(resolve, reject) {
      setTimeout((function() {
        return resolve({id: machineDescription.id});
      }), 500);
    }));
  }
  function destroyMachine(machineID) {
    return new Promise((function(resolve, reject) {
      setTimeout((function() {
        return resolve(machineID);
      }), 500);
    }));
  }
});

//# sourceMappingURL=../providers/dummy.js.map