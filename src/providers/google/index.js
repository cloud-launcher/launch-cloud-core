module.exports = google;


function google(api, config) {
  const status = {};

  return {
    createMachine,
    destroyMachine,

    verifyAccount,

    status
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

  function verifyAccount() {
    return new Promise((resolve, reject) => {
      reject({error: 'Unauthorized', provider: google.$name});
    });
  }

  function apiCallbackHandler(resolve, reject) {
    return (error, data) => {
      if (error) reject(error, data);
      else resolve(data);
    };
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
