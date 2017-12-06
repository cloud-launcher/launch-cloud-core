"use strict";
var 
var baseDir = path.join(__dirname, '..'),
    cloudMachines = JSON.parse(fs.readFileSync(path.join(baseDir, 'cloud.machines')).toString());
var providers = {};
_.each(cloudMachines, (function(machine) {
  var provider = providers[machine.provider] || require('./providers/' + machine.provider)({token: process.env.DO_TOKEN});
  provider.destroyMachine(machine, (function(data) {
    return console.log('destroyed', machine.id);
  }), (function(erpath = require('path')ror, data) {
    return,
    _ = require('lodash'), machine.id);
  }), (function(error, data) {
    return console.log('error', error);
  }));
}));

//# sourceMappingURL=destroy.js.map