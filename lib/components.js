var p = require( "path" );
var cutils = require( "component" ).utils;
var fs = require( "fs" );

var names = [];
var pathByName = {};

var globalsNames = [];
var globalsPathByName = {};

exports.add = function( name, path ) {
	names.push( name );
	pathByName[ name ] = getPathWithoutName( name, path );
}

function getPathWithoutName( name, path ) {
	var idx = path.lastIndexOf( name );
	if( idx < 0 ) {
		return name;
	}
	return path.substr( 0, idx );
}

exports.remove = function( name ) {
	var idx = names.indexOf( name );
	if( idx < 0 ) {
		return;
	}

	names.splice( idx, 1 );

	pathByName[ name ] = null;
	delete pathByName[ name ];
}

exports.addGlobals = function() {
	var path = process.cwd() + "/components";

	var j, m;
	var components;
	var folderName, componentName;
	var folders = fs.readdirSync( path );
	for( var i = 0, n = folders.length; i < n; i++ ) {
		folderName = folders[ i ];
		components = fs.readdirSync( path + "/" + folderName );
		for( j = 0, m = components.length; j < m; j++ ) {
			componentName = formatGlobalName( components[ j ] );
			globalsNames.push( componentName );
			globalsPathByName[ componentName ] = folderName + "/" + components[ j ];
		}
	}
}

exports.getPath = function( name ) {
	return pathByName[ name ];
}

exports.getGlobalPath = function( name ) {
	return globalsPathByName[ name ];
}

function formatGlobalName( name ) {
	var idx = name.indexOf( "." );
	if( idx >= 0 ) {
		return name.substr( 0, idx );
	}
	return name;
}