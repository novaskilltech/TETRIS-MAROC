// Fix for Node.js v22 on Windows where fs.readlink / fs.promises.readlink returns EISDIR instead of EINVAL for regular files
const fs = require('fs');

if (process.platform === 'win32') {
  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;
  const origPromisesReadlink = fs.promises ? fs.promises.readlink : null;

  fs.readlink = function (path, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    const opt = typeof options === 'function' ? {} : options;

    origReadlink.call(fs, path, opt, (err, linkString) => {
      if (err && err.code === 'EISDIR') {
        const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = 'EINVAL';
        einval.errno = -4071;
        return cb(einval);
      }
      return cb(err, linkString);
    });
  };

  fs.readlinkSync = function (path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      if (err && err.code === 'EISDIR') {
        const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = 'EINVAL';
        einval.errno = -4071;
        throw einval;
      }
      throw err;
    }
  };

  if (origPromisesReadlink) {
    fs.promises.readlink = async function (path, options) {
      try {
        return await origPromisesReadlink.call(fs.promises, path, options);
      } catch (err) {
        if (err && err.code === 'EISDIR') {
          const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
          einval.code = 'EINVAL';
          einval.errno = -4071;
          throw einval;
        }
        throw err;
      }
    };
  }
}
