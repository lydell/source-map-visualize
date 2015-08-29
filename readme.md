Overview [![Build Status](https://travis-ci.org/lydell/source-map-visualize.svg?branch=master)](https://travis-ci.org/lydell/source-map-visualize)
========

[Tobias Koppers]’ [source map visualization] is a great tool for inspecting
source maps, both for source map consumers trying to set up their build tool
correctly, as well as for developers of source map producing compilers. However,
uploading the generated file, the source map and all the source files is
tedious. source-map-visualize simplifies that. Just type:

```sh
$ source-map-visualize fixtures/example.js
```

... and the visualizer will be opened in your default browser with all the files
pre-loaded! (`fixture/example.js` exists in this repository, so you could try
that straight away!)

[Tobias Koppers]: https://github.com/sokra/
[source map visualization]: https://sokra.github.io/source-map-visualization/

Installation
============

```sh
$ npm install -g source-map-visualize
```

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
