// Copyright 2015, 2016 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs = require('fs')
var test = require('ava')
var testCli = require('test-cli')

var lib = require('./')
var opened
lib.open = function (url) { opened = url }

var cli = require('./cli')
var run = testCli.bind(null, cli)

function testUrl (t, url) {
  t.regexTest(/^https?:\/\/[^/]+\/[^#]+#.{100,}\n?$/, url)
}

function success (t, fn) {
  return function (stdout, stderr, code) {
    t.is(stderr, '')
    t.is(code, 0)
    fn(stdout, function (stdout2, stderr2, code2) {
      t.is(stdout2, stdout)
      t.is(stderr2, stderr)
      t.is(code2, code)
    })
  }
}

function failure (t, fn) {
  return function (stdout, stderr, code) {
    t.is(stdout, '')
    t.is(code, 1)
    fn(stderr)
  }
}

function okUrlOutput (t) {
  return success(t, function (stdout) {
    testUrl(t, stdout)
  })
}

test('help and no arguments', function (t) {
  t.plan(9)
  var helpText = fs.readFileSync('help.txt').toString()
  run(success(t, function (stdout, identicalOutput) {
    t.is(stdout, helpText)
    run('--help', identicalOutput)
    run('-h', identicalOutput)
  }))
})

test('version', function (t) {
  t.plan(6)
  var version = require('./package.json').version
  run('--version', success(t, function (stdout, identicalOutput) {
    t.is(stdout, version + '\n')
    run('-v', identicalOutput)
  }))
})

test('too many arguments', function (t) {
  t.plan(3)
  run('one', 'two', 'three', failure(t, function (stderr) {
    t.is(stderr, 'Too many arguments\n')
  }))
})

test('unknown option', function (t) {
  t.plan(6)
  run('one', '--unknown', 'two', failure(t, function (stderr) {
    t.is(stderr, 'Unknown option --unknown\n')
  }))
  run('-ä', failure(t, function (stderr) {
    t.is(stderr, 'Unknown option -ä\n')
  }))
})

test('non-existent file', function (t) {
  t.plan(3)
  run('non-existent.js', failure(t, function (stderr) {
    t.regexTest(/no such file.+non-existent\.js.*\n$/, stderr)
  }))
})

test('directory as target', function (t) {
  t.plan(3)
  run('fixtures', failure(t, function (stderr) {
    t.regexTest(/directory.*\n$/, stderr)
  }))
})

test('non-existent map', function (t) {
  t.plan(3)
  run(
    'fixtures/no-comment.js', 'non-existent.map',
    failure(t, function (stderr) {
      t.regexTest(/no such file.+non-existent\.map.*\n\n.+/, stderr)
    })
  )
})

test('directory as map target', function (t) {
  t.plan(3)
  run('fixtures/no-comment.js', 'fixtures', failure(t, function (stderr) {
    t.regexTest(/directory.*\n\n.+/, stderr)
  }))
})

test('non-existent source', function (t) {
  t.plan(3)
  run(
    'fixtures/no-comment.js', 'fixtures/non-existent-source.map', '-p',
    okUrlOutput(t)
  )
})

test('missing sourceMappingURL comment', function (t) {
  t.plan(3)
  run('fixtures/no-comment.js', failure(t, function (stderr) {
    t.is(stderr, 'No sourceMappingURL found in fixtures/no-comment.js\n')
  }))
})

test('invalid json', function (t) {
  t.plan(4)
  run(
    'fixtures/no-comment.js', 'fixtures/invalid-json.map',
    failure(t, function (stderr) {
      t.regexTest(/^Invalid JSON in source map: .+\n\n.+/, stderr)
      var jsonText = fs.readFileSync('fixtures/invalid-json.map').toString()
      t.is(stderr.slice(-jsonText.length - 1), jsonText + '\n')
    })
  )
})

test('regular usage and print', function (t) {
  t.plan(14)
  t.is(opened, undefined)
  run('fixtures/comment.js', success(t, function (stdout) {
    t.is(stdout, '')
    testUrl(t, opened)
    run(
      'fixtures/comment.js', '--print',
      success(t, function (stdout2, identicalOutput) {
        t.is(stdout2, opened + '\n')
        run('fixtures/comment.js', '-p', identicalOutput)
        run('-p', 'fixtures/comment.js', identicalOutput)
      })
    )
  }))
})

test('data uri', function (t) {
  t.plan(6)
  run(
    'fixtures/data-uri.js', '-p',
    success(t, function (stdout, identicalOutput) {
      testUrl(t, stdout)
      run('fixtures/data-uri.js', 'fixtures/data-uri-ed.map', '-p',
          identicalOutput)
    })
  )
})

test('invalid source map as data uri', function (t) {
  t.plan(3)
  run(
    'fixtures/invalid-data-uri.js',
    failure(t, function (stderr) {
      t.is(stderr, [
        '"version" is a required argument.',
        '',
        'sourceMappingURL: data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VzIjpbImZvby5qcyJdLCJuYW1lcyI6W119',
        'Source map URL: null',
        'Sources fetched relative to: fixtures/invalid-data-uri.js',
        'Source map content: {',
        '  "mappings": "AAAA",',
        '  "sources": [',
        '    "foo.js"',
        '  ],',
        '  "names": []',
        '}'
      ].join('\n') + '\n')
    })
  )
})

test('invalid source map as data uri', function (t) {
  t.plan(3)
  run(
    'fixtures/no-comment.js', 'fixtures/missing-mappings.map',
    failure(t, function (stderr) {
      t.is(stderr, [
        '"mappings" is a required argument.',
        '',
        'sourceMappingURL: null',
        'Source map URL: fixtures/missing-mappings.map',
        'Sources fetched relative to: fixtures/missing-mappings.map',
        'Source map content: {',
        '  "version": 3,',
        '  "sources": [',
        '    "source1.js"',
        '  ]',
        '}'
      ].join('\n') + '\n')
    })
  )
})

test('sourceRoot', function (t) {
  t.plan(15)
  run(
    'fixtures/no-comment.js', 'fixtures/source-root.map', '-p',
    success(t, function (stdout) {
      testUrl(t, stdout)
      run(
        'fixtures/no-comment.js', 'fixtures/source-root.map', '-p',
        '--no-source-root',
        success(t, function (stdout2, identicalOutput) {
          t.not(stdout2, stdout)
          run('fixtures/no-comment.js', 'fixtures/source-root.map', '-p',
              '--no-r', identicalOutput)
          run('fixtures/no-comment.js', 'fixtures/source-root.map', '-p',
              '--source-root', '', identicalOutput)
          run('fixtures/no-comment.js', 'fixtures/source-root.map',
              '-pr', '.', identicalOutput)
        })
      )
    })
  )
})

test('coffee', function (t) {
  t.plan(3)
  run('fixtures/example.js', '-p', okUrlOutput(t))
})

test('complex', function (t) {
  t.plan(3)
  run('fixtures/sub/complex.js', '-p', okUrlOutput(t))
})

test('complex – lib', function (t) {
  t.plan(8)
  lib.resolve(
    {generatedFilePath: 'fixtures/sub/complex.js'},
    function (error, result) {
      t.error(error)
      t.is(result.generatedContent, [
        '// generated',
        '/*# sourceMappingURL=../../fixtures/./complex.map */',
        ''
      ].join('\n'))
      t.same(result.map, {
        version: 3,
        mappings: 'AAAA',
        sourceRoot: '',
        sources: ['source1.js', '../.gitignore',
                  'http://example.com/virtual.js', './sub/source1.js'],
        sourcesContent: [null, null, '// virtual'],
        names: []
      })
      var s = result.sourcesContent
      t.is(s.length, 4)
      t.is(s[0], '// source1\n')
      t.regexTest(/node_modules/, s[1])
      t.is(s[2], '// virtual')
      t.is(s[3], '// source1-sub\n')
    }
  )
})

test('displaySourceMap – lib', function (t) {
  t.plan(1)
  t.is(lib.displaySourceMap({
    version: 3,
    mappings: ';AAAA;AAAA,MAAA,8BAAA;IAAA;;;EAAM;IACS,gBAAC,IAAD;MAAC,IAAC,CAAA,OAAD;MACZ,IAAC',
    sources: ['source1.js', '../.gitignore',
              'http://example.com/virtual.js', './sub/source1.js'],
    sourcesContent: [null, null, 'function add(first, second) \n {  return first + second;\n}\n// comment at the end']
  }), [
    '{',
    '  "version": 3,',
    '  "mappings": ";AAAA;AAAA,MAAA,8BAAA;IAAA;;;EAAM;IACS,gBAAC,IAAD;MAAC,IAAC,CAAA,OA...",',
    '  "sources": [',
    '    "source1.js",',
    '    "../.gitignore",',
    '    "http://example.com/virtual.js",',
    '    "./sub/source1.js"',
    '  ],',
    '  "sourcesContent": [',
    '    null,',
    '    null,',
    '    "function add(first, second) \\n {  return first + second;\\n}\\n// commen..."',
    '  ]',
    '}'
  ].join('\n'))
})
