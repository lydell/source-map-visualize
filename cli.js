// Copyright 2015, 2016 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs = require('fs')
var path = require('path')
var minimist = require('minimist')
var sourceMap = require('source-map')
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
    var report

    if (error) {
      var message = error.message
      if (error instanceof SyntaxError) {
        message = 'Invalid JSON in source map: ' + message
      }
      if (error.sourceMapData) {
        report = createErrorReport(
          message, error.sourceMapData,
          'Source map content: ' + lib.displaySourceMap(error.sourceMapData.map)
        )
      } else {
        report = message
      }
      write(process.stderr, report)
      return done(1)
    }

    try {
      new sourceMap.SourceMapConsumer(result.map) // eslint-disable-line no-new
    } catch (error) {
      report = createErrorReport(
        error.message, result,
        'Source map content: ' + lib.displaySourceMap(result.map)
      )
      write(process.stderr, report, done)
      return done(1)
    }

    result.sourcesContent = result.sourcesContent.map(function (item, index) {
      return typeof item === 'string' ? item : createErrorReport(
        item.message, result, 'Source: ' + result.map.sources[index]
      )
    })

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

function createErrorReport (message, data, extra) {
  return [
    message,
    '',
    'sourceMappingURL: ' + data.sourceMappingURL,
    'Source map URL: ' + data.url,
    'Sources fetched relative to: ' + data.sourcesRelativeTo,
    extra
  ].join('\n')
}
