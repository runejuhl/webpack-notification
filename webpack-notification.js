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

  var e, isError = false;
  if (stats.hasErrors()) {
    e = stats.compilation.errors[0];
    isError = true;
  }

  if (!e && stats.hasWarnings()) {
    e = stats.compilation.warnings[0];
  }

  if (!e) {
    execNotify(project, 'Compile succeeded in ' + compilationTime + ' msecs');
    return;
  }

  var line = e.error.loc ? e.error.loc.line : e.error.line;
  var column = e.error.loc ? e.error.loc.column : e.error.column;
  var loc = e.name+' in '+getFileName(stats, e) +' at ' + line + ':' + column;

  if (isError) {
    execNotify(project, 'Compile failed; ' + loc);
  } else {
    execNotify(project, 'Compile succeeded in ' + compilationTime + ' msecs with ' + stats.compilation.warnings.length + ' warning(s): ' + loc);
  }

}

WebpackNotificationPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', this.notify);
};

module.exports = WebpackNotificationPlugin;
