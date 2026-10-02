const fs = require('fs');

function wrapError(err, path) {
  if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
    const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
    e.code = 'EINVAL';
    e.errno = -4071;
    e.syscall = 'readlink';
    e.path = path;
    return e;
  }
  return err;
}

const origReadlink = fs.readlink;
fs.readlink = function (...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const path = args[0];
  if (cb) {
    return origReadlink.call(fs, ...args, (err, linkString) => {
      cb(wrapError(err, path), linkString);
    });
  }
  return origReadlink.call(fs, ...args);
};

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    throw wrapError(err, path);
  }
};

if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      throw wrapError(err, path);
    }
  };
}
