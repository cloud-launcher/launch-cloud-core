import buildLog from './buildLog';

import _ from 'lodash';

module.exports = (cloud, providers, logFn, request, dockerHubApiRoot) => {
  const {log, start, ok, bad} = buildLog(logFn, 'Validate');

  start('Cloud Description');

  const {
    domain,
    root,
    authorizations,
    locations,
    configuration,
    roles,
    containers
  } = cloud;

  const promise = validateDomain(cloud)
          .then(validateRoot)
          .then(validateAuthorizations)
          .then(validateLocations)
          .then(validateProviderCredentials)
          .then(validateContainers)
          .then(validateRoles)
          .then(validateConfiguration)
          .then(() => {
            ok('Cloud Description');
            return cloud;
          });

  promise.catch(error => {
    return bad('Cloud Description', {error});
  });

  return promise;

  function validateDomain() {
    return new Promise((resolve, reject) => {
      if (cloud.domain) {
        start('Domain');
        ok('Domain');
      }

      resolve();
    });
  }

  function validateRoot() {
    return new Promise((resolve, reject) => {
      if (cloud.root) {
        start('Root');
        ok('Root');
      }

      resolve();
    });
  }

  function validateAuthorizations() {
    return new Promise((resolve, reject) => {
      if (cloud.authorizations) {
        start('Authorizations');
        ok('Authorizations');
      }

      resolve();
    });
  }

  // TODO: This can probably be cleaned up.
  function validateLocations() {
    return new Promise((resolve, reject) => {
      start('Locations');

      const invalidProviders = _.filter(_.keys(locations), providerName => !providers[providerName]);

      if (invalidProviders.length > 0) {
        return reject(bad('Locations', {invalidProviders}));
      }

      const invalidLocations = _.pick(
                                  _.mapValues(locations, (locations, providerName) => {
                                    const provider = providers[providerName];
                                    return _.filter(locations, location => !provider.profile.locations[location]);
                                  }),
                                  locations => locations.length > 0);

      if (_.keys(invalidLocations).length > 0) {
        return reject(bad('Locations', {invalidLocations}));
      }

      let providerCount = 0;
      const locationCount = _.reduce(locations, (count, locations, providerName) => {
        const provider = providers[providerName];

        if (locations.length) providerCount++;

        return count + locations.length;
      }, 0);

      if (isNaN(locationCount) || locationCount === 0) {
        return reject(bad('Locations', {status: 'No locations selected!'}));
      }

      ok('Locations', {status: `Will Launch on ${providerCount} Provider${providerCount > 1 ? 's' : ''} in ${locationCount} Location${locationCount > 1 ? 's' : ''}!`});

      resolve();
    });
  }

  function validateProviderCredentials() {
    return new Promise((resolve, reject) => {
      start('Credentials');

      const usedProviders = _.map(_.pick(cloud.locations, locations => {
        return locations.length > 0;
      }), (locations, providerName) => providers[providerName]);

      const missing = {};

      _.each(usedProviders, provider => {
        console.log(provider);
        const missingValues = checkProviderConfiguration(provider);
        if (missingValues.length > 0) missing[provider.name] = missingValues;
      });

      if (_.keys(missing).length > 0) {
        return reject(bad('Credentials', {missing}));
      }

      Promise
        .all(_.map(usedProviders, provider => provider.api.verifyAccount()))
        .then((error, data, response) => {
          ok('Credentials');
          resolve();
        })
        .catch(e => {
          const {error, data, response, provider} = e;
          reject(bad('Credentials', {error, data, provider}));
        });

      function checkProviderConfiguration(provider) {
        const {credentialSchema, credentials} = provider,
              missing = [];

        _.each(credentialSchema, (schema, name) => {
          const value = credentials[name];

          console.log(name, value);

          // Just basic checks for now
          if (value === undefined ||
              value === null ||
              value.length === 0) {
            missing.push(name);
          }
        });

        return missing;
      }
    });
  }

  function validateContainers() {
    start('Containers');

    let requests = {},
        validationFailed = false;

    const validationPromise = Promise.all(_.map(containers, (containerDescription, name) => {
      return checkDockerRegistry(containerDescription.container || name);
    }));

    validationPromise.catch(e => {
      log('validateContainers failed');
      _.each(requests, (request, url) => {
        log('Aborting', url);
        request.abort();
      });
      validationFailed = true;
    });

    return validationPromise;

    function checkDockerRegistry(containerName) {
      let [namespace, image] = containerName.split('/'),
          [repository, tag] = (image || namespace).split(':'),
          qualifiedName = namespace + (image ? `/${repository}` : '');


      tag = tag || 'latest';
      const url = `${dockerHubApiRoot}/v1/repositories/${qualifiedName}/tags/${tag}`;
      log(`Verifying container ${qualifiedName}:${tag} exists...`);
      return new Promise((resolve, reject) => {
        start('Container', {containerName});
        requests[url] = request(url, (error, response, body) => {
          delete requests[url];

          // if (error) reject(new Error(['Error checking Docker registry', error].join(' ')));
          if (error) reject({type: 'HubConnection', error: 'Could not connect!'});
          else {
            if (response.statusCode === 200) {
              if (!log(`Found ${qualifiedName}:${tag}`));
              ok('Container', {containerName});
              ok('Containers');
              resolve();
            }
            // else reject(new Error(`Did not find ${qualifiedName}:${tag} on Docker registry!`));
            else {
              bad('Container', {containerName});
              bad('Containers');
              reject({type: 'MissingContainer', container: {qualifiedName, tag}});
            }
          }
        });
      });
    }
  }

  function validateRoles() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  function validateConfiguration() {
    return new Promise((resolve, reject) => {
      // log('Validating Configuration', cloud);
      start('Configuration');
      ok('Configuration');
      resolve();
    });
  }
};