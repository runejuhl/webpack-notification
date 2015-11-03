const child_process = require('child_process');
const strip_ansi = require('strip-ansi');
const escapeShell = function(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

/**
 * @module WebpackNotificationPlugin
 */

/**
 * @constructor
 * @param {options} FIXME
 */
function WebpackNotificationPlugin(options) {
  if (!options) {
    options = {};
  }

  this.notifyCommand = options.notifyCommand || 'notify-send -t 2000';
};

var execNotify = function(project, message) {
  message = escapeShell(message);
  child_process.exec('notify-send -t 4000 ' + project + ' ' + message, function(error, stdout, stderr) {
    if (error) {
      console.log('webpack-notification failed', error, stdout, stderr)
    }
  });
}

WebpackNotificationPlugin.prototype.notify = function(stats) {
  var compilationTime =  stats.endTime-stats.startTime;
  var project = stats.compilation.modules[0].name;

  if (!project) {
    project = 'webpack';
  }

  var getFileName = function(stats, e) {
    var base = stats.compilation.options.context;
    var fullName = e.module.resource;
    return fullName.replace(base, '');
  };

  if (stats.hasErrors()) {
    var errorObj = stats.compilation.errors[0];
  console.log('errorMsg', errorObj.message);
  console.log('errorMsg', strip_ansi(errorObj.message));
    execNotify(project, 'Compile failed; '+errorObj.name+' in '+getFileName(stats, errorObj) +' at ' + errorObj.error.loc.line + ':' + errorObj.error.loc.column);
    return;
  }

  // FIXME
  if (stats.hasWarnings()) {
    execNotify(project, 'Compile succeeded in ' + compilationTime + ' msecs with ' + stats.compilation.warnings.length + ' warning(s)');
    return;
  }

  execNotify(project, 'Compile succeeded in ' + compilationTime + ' msecs');
}

WebpackNotificationPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', this.notify);
};

module.exports = WebpackNotificationPlugin;
