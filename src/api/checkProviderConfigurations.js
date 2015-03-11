import _ from 'lodash';

module.exports = (cloud, providers) => {
  console.log('checking', providers);

  const results = {};

  _.each(cloud.locations, (locations, providerName) => {
    if (locations.length > 0) {
      const missingValues = checkProviderConfiguration(providerName);
      if (missingValues.length > 0) results[providerName] = missingValues;
    }
  });

  return results;

  function checkProviderConfiguration(providerName) {
    const {credentialSchema, credentials} = providers[providerName],
          missing = [];

    _.each(credentialSchema, (schema, name) => {
      const value = credentials[name];

      // Just basic checks for now
      if (value === undefined ||
          value === null ||
          value.length === 0) {
        missing.push(name);
      }
    });

    return missing;
  }
};