module.exports = amazon;


function amazon(api, config) {
  return {
    createMachine,
    destroyMachine
  };

  function createMachine(machineDescription) {
    return new Promise((resolve, reject) => {
      const api = new api(config.token),
            {
              id,
              location,
              size,
              image,
              keys,
              userData
            } = machineDescription;

      // create code goes here
    });
  }

  function destroyMachine(machine) {
    return new Promise((resolve, reject) => {
      const api = new api(config.token);

      // destroy code goes here
    });
  }

  function apiCallbackHandler(resolve, reject) {
    return (error, data) => {
      if (error) reject(error, data);
      else resolve(data);
    };
  }
}

amazon.$name = 'amazon';
amazon.$targets = ['coreos'];
