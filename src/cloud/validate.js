import _ from 'lodash';

module.exports = (cloud, providers, log, request, dockerHubApiRoot) => {
  log('Validating Cloud Description');

  const {
    domain,
    root,
    authorizations,
    locations,
    configuration,
    roles,
    containers
  } = cloud;

  return validateDomain(cloud)
          .then(validateRoot)
          .then(validateAuthorizations)
          .then(validateLocations)
          .then(validateProviderCredentials)
          .then(validateContainers)
          .then(validateRoles)
          .then(validateConfiguration)
          .then(() => { return cloud; });

  function start(name, ...args) {
    log({start: name, args});
  }

  function ok(name, ...args) {
    log({ok: name, args});
  }

  function bad(name, ...args) {
    log({bad: name, args});
  }

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

  function validateLocations() {
    return new Promise((resolve, reject) => {
      start('Locations');

      let providerCount = 0;
      const locationCount = _.reduce(locations, (count, locations, providerName) => {
        const provider = providers[providerName];

        if (!provider) {
          reject(new Error(['No provider with name', providerName].join(' ')));
          bad('Locations');
          return;
        }

        _.each(locations, location => {
          if (!provider.profile.locations[location]){
            reject(new Error(['Provider', providerName, 'has no location', location].join(' ')));
            bad('Locations');
            return;
          }
        });

        if (locations.length) providerCount++;

        return count + locations.length;
      }, 0);

      if (isNaN(locationCount) || locationCount === 0) {
        reject(new Error('No locations selected!'));
        bad('Locations');
        return;
      }

      log(`Will Launch on ${providerCount} Provider${providerCount > 1 ? 's' : ''} in ${locationCount} Location${locationCount > 1 ? 's' : ''}!`);

      ok('Locations');
      resolve();
    });
  }

  function validateProviderCredentials() {
    return new Promise((resolve, reject) => {
      // log('Validating Provider Credentials');

      start('Credentials');

      // can probably run a map over this
      const usedProviders = _.map(_.pick(cloud.locations, locations => {
        return locations.length > 0;
      }), (locations, providerName) => providers[providerName]);

      console.log('used', usedProviders);

      const missing = {};

      _.each(usedProviders, provider => {
        if (locations.length > 0) {
          const missingValues = checkProviderConfiguration(provider);
          if (missingValues.length > 0) missing[provider.name] = missingValues;
        }
      });

      if (_.keys(missing).length > 0) {
        bad('Credentials');
        reject({type: 'Credentials', missing});
      }
      else {
        Promise.all(_.map(usedProviders, provider => provider.api.verifyAccount()))
                .then((error, data, response) => {
                  ok('Credentials');
                  resolve();
                })
                .catch((error, data, response) => {
                  bad('Credentials');
                  reject({type: 'Credentials', error, data});
                });
      }

      function checkProviderConfiguration(providerName) {
        const {credentialSchema, credentials} = provider,
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
    });
  }

  function validateContainers() {
    // log('Validating Containers');

    start('Containers');

    let requests = {},
        validationFailed = false;

    const validationPromise = Promise.all(_.map(containers, (containerDescription, name) => {


      // return checkDockerRegistry(namespace, repository, tag);
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
        requests[url] = request(url, (error, response, body) => {
          delete requests[url];

          // if (error) reject(new Error(['Error checking Docker registry', error].join(' ')));
          if (error) reject({type: 'HubConnection', error: 'Could not connect!'});
          else {
            if (response.statusCode === 200) {
              if (!log(`Found ${qualifiedName}:${tag}`));
              ok('Credentials');
              resolve();
            }
            // else reject(new Error(`Did not find ${qualifiedName}:${tag} on Docker registry!`));
            else {
              bad('Credentials');
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