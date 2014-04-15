var _ = require( "underscore" );
var fs = require( "fs-extra" );
var path = require( "path" );
var cutils = require( "component" ).utils;

// TODO: The component-app has to change once the tool is deployed
var templateComponentPath = path.resolve( process.cwd() + "/node_modules/component-app/template/component.json.tpl" );
var templateComponent = fs.readFileSync( templateComponentPath ).toString();

module.exports = function( link ) {
	var name = link.substr( link.lastIndexOf( "/" ) + 1 );
	var template = _.template( templateComponent, { name: name } );
	save( link + "/component.json", template );
}

function save( link, template ) {
	var err = fs.outputFileSync( link, template );
	if ( err ) cutils.fatal( errr );
	cutils.log( "created", link );
}