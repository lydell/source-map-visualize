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
        callback(null, {
          generatedContent: generatedContent,
          sourceMap: result.map,
          sourcesContent: result.sourcesContent
        })
      }
    )
  })
}

exports.createUrl = function (data) {
  return URL_BASE + '#base64,' +
    [data.generatedContent, JSON.stringify(data.sourceMap)]
      .concat(data.sourcesContent).map(encode).join(',')
}

function encode (str) {
  return new Buffer(unescape(encodeURIComponent(str))).toString('base64')
}

exports.open = opn
