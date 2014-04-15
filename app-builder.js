var fs = require( "fs" );
var resolve = require('component-resolver');
var Build = require('component-build');

var write = fs.writeFileSync;

var options = {
  development: false,
  install: true,
}

var app = require( "component-app" );
app( function() {

	resolve(process.cwd(), options, function (err, tree) {
	  if (err) throw err;

	  var build = Build(tree, options);

	  build.scripts(function (err, string) {
	    if (err) throw err;
	    if (!string) return;
	    write('build/build.js', string);
	  })

	  build.styles(function (err, string) {
	    if (err) throw err;
	    if (!string) return;
	    write('build/build.css', string);
	  })

	  build.files(function (err) {
	    if (err) throw err;
	  })
	})

} );