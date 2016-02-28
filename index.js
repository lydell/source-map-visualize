// Copyright 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs = require('fs')
var opn = require('opn')
var sourceMapResolve = require('source-map-resolve')

var URL_BASE = 'https://sokra.github.io/source-map-visualization/'

exports.resolve = function (options, callback) {
  fs.readFile(options.generatedFilePath, function (error, generatedContent) {
    if (error) {
      return callback(error)
    }

    generatedContent = generatedContent.toString()

    var content = generatedContent
    var filepath = options.generatedFilePath
    if (typeof options.sourceMapPath === 'string') {
      content = null
      filepath = options.sourceMapPath
    }
    var resolveOptions = {
      sourceRoot: options.sourceRoot
    }

    sourceMapResolve.resolve(
      content, filepath, fs.readFile, resolveOptions,
      function (error, result) {
        if (error) {
          return callback(error)
        }
        if (result === null) {
          return callback(
            new Error('No sourceMappingURL found in ' + filepath)
          )
        }
        result.generatedContent = generatedContent
        callback(null, result)
      }
    )
  })
}

exports.createUrl = function (data) {
  return URL_BASE + '#base64,' +
    [data.generatedContent, JSON.stringify(data.map)]
      .concat(data.sourcesContent).map(encode).join(',')
}

function encode (str) {
  return new Buffer(unescape(encodeURIComponent(str))).toString('base64')
}

exports.displaySourceMap = function (map) {
  if (typeof map === 'string') {
    return map
  } else {
    return JSON.stringify(map, function (key, value) {
      switch (key) {
        case 'mappings':
          return truncate(value, 70)
        case 'sourcesContent':
          return value.map(function (item) {
            return truncate(item, 70)
          })
        default:
          return value
      }
    }, 2)
  }
}

function truncate (string, maxLength) {
  if (typeof string === 'string' && string.length > maxLength) {
    return string.slice(0, maxLength - 3) + '...'
  } else {
    return string
  }
}
exports.open = opn
