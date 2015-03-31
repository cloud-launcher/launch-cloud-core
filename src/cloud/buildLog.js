
module.exports = function buildLog(logFn, type) {
  const log = ((log) => (...args) => { log(...args); return args; })(logFn);

  return {log, start, ok, bad};

  function start(name, ...args) {
    return log({type, start: name, args});
  }

  function ok(name, ...args) {
    return log({type, ok: name, args});
  }

  function bad(name, ...args) {
    return log({type, bad: name, args});
  }
};