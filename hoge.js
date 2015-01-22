var jsdiff = require('./lib/diff')

console.log( jsdiff.diffLines('hoge\nfuga\nfuga\nfuga', 'hoge\nfuga') );
console.log( jsdiff.diffLinesWithNumber('hoge', 'hoge\nfuga') );

