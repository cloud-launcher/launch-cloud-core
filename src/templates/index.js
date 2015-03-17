// Must be a var require so that brfs will inline the reads even after transpile
var fs = require('fs');

import hogan from 'hogan.js';

module.exports = {
  // Yes, it sucks that the paths are relative to root directory, blame brfs! (check gulpfile.js task 'templates')
  bootstrap:  hogan.compile(fs.readFileSync('./src/templates/bootstrap.sh', 'utf8').toString()),
  cloudConfig: hogan.compile(fs.readFileSync('./src/templates/cloud-config', 'utf8').toString()),
  containerService: hogan.compile(fs.readFileSync('./src/templates/container.service', 'utf8').toString())
};