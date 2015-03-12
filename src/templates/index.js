var fs = require('fs');

module.exports = {
  // Yes, it sucks that the paths are relative to root directory, blame brfs! (check gulpfile.js task 'templates')
  cloudConfig: fs.readFileSync('./src/templates/cloud-config', 'utf8').toString(),
  bootstrap:  fs.readFileSync('./src/templates/bootstrap.sh.template', 'utf8').toString()
};