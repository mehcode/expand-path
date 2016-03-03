var fs = require("fs");
var untildify = require("untildify");
var consistentEnv = require("consistent-env");

// Expand variables in path
function expandVariables(pathname, env) {
  // %variable%
  pathname = pathname.replace(/%([^%]+)%/g, function(_, n) {
    return env[n];
  });

  // ${variable}
  pathname = pathname.replace(/\$\{([^\}]+)\}/g, function(_, n) {
    return env[n];
  });

  // $variable
  pathname = pathname.replace(/\$([A-Za-z0-9]+)/g, function(_, n) {
    return env[n];
  });

  return pathname;
};

exports.expandVariables = expandVariables;

// function(string): Promise<string>
module.exports = (pathname) => {
  return new Promise((resolve, reject) => {
    // Resolve `~`
    pathname = untildify(pathname);

    // Get a consistent environment (for variable expansion)
    consistentEnv.async().then((env) => {
      // Resolve variables
      pathname = expandVariables(pathname, env);

      // Get the realpath and resolve with that
      fs.realpath(pathname, (err, realPathname) => {
        if (err) return reject(err);
        resolve(realPathname);
      });
    });
  });
};
