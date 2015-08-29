// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs = require('fs')
var path = require('path')
var minimist = require('minimist')
var lib = require('./')

var minimistOptions = {
  boolean: ['help', 'print', 'version'],
  string: ['source-root'],
  default: {
    'source-root': true
  },
  alias: {
    'help': 'h',
    'print': 'p',
    'source-root': 'r',
    'version': 'v'
  },
  unknown: function (arg) {
    if (arg[0] === '-') {
      throw new Error('Unknown option ' + arg)
    }
  }
}

module.exports = function cli (process, done) {
  var argv
  try {
    argv = minimist(process.argv.slice(2), minimistOptions)
  } catch (error) {
    write(process.stderr, error.message)
    return done(1)
  }

  if (argv['version']) {
    write(process.stdout, require('./package.json').version)
    return done(0)
  }

  if (argv['help'] || argv._.length === 0) {
    return fs.createReadStream(path.join(__dirname, 'help.txt'))
      .on('end', done.bind(null, 0))
      .pipe(process.stdout)
  }

  if (argv._.length > 2) {
    write(process.stderr, 'Too many arguments')
    return done(1)
  }

  var options = {
    generatedFilePath: argv._[0],
    sourceMapPath: argv._[1],
    sourceRoot: argv['source-root']
  }
  lib.resolve(options, function (error, result) {
    if (error) {
      var message = error.message
      if (error instanceof SyntaxError) {
        message = 'Invalid JSON in source map: ' + message
      }
      write(process.stderr, message, done)
      return done(1)
    }
    var url = lib.createUrl(result)
    if (argv['print']) {
      write(process.stdout, url)
    } else {
      lib.open(url)
    }
    done(0)
  })
}

function write (stream, message) {
  stream.write(message + '\n')
}
