// Must be a var require so that brfs will inline the reads even after transpile
var fs = require('fs');
var hogan = require('hogan.js');

module.exports = {
  // Yes, it sucks that the paths are relative to root directory, blame brfs! (check gulpfile.js task 'templates')
  bootstrap: hogan.compile(fs.readFileSync('./src/templates/bootstrap.sh', 'utf8').toString()),
  cloudConfig: hogan.compile(fs.readFileSync('./src/templates/cloud-config', 'utf8').toString()),
  containerService: hogan.compile(fs.readFileSync('./src/templates/container.service', 'utf8').toString()),
  'container@Service': hogan.compile(fs.readFileSync('./src/templates/container@.service', 'utf8').toString()),
  util_sh: fs.readFileSync('./src/templates/util.sh', 'utf8').toString()
};