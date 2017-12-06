"use strict";
module.exports = function buildLog(logFn, type) {
  var log = ((function(log) {
    return (function() {
      for (var args = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        args[$__0] = arguments[$__0];
      log.apply((void 0), $traceurRuntime.spread(args));
      return args;
    });
  }))(logFn);
  return {
    log: log,
    start: start,
    ok: ok,
    bad: bad
  };
  function start(name) {
    for (var args = [],
        $__0 = 1; $__0 < arguments.length; $__0++)
      args[$__0 - 1] = arguments[$__0];
    return log({
      type: type,
      start: name,
      args: args
    });
  }
  function ok(name) {
    for (var args = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      args[$__1 - 1] = arguments[$__1];
    return log({
      type: type,
      ok: name,
      args: args
    });
  }
  function bad(name) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    return log({
      type: type,
      bad: name,
      args: args
    });
  }
};

//# sourceMappingURL=../cloud/buildLog.js.map