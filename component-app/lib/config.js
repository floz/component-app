var p = require( "path" );
var fs = require( "fs-extra" );
var utils = require( "./utils" );
var cutils = require( "component" ).utils;

module.exports = Config;

function Config( folder ) {
	this.folder = folder;
	this.fileList = [];
	this.jsonPath = this.folder.path + "/component.json";
	this.json = require( this.jsonPath );
}

Config.prototype.init = function( files ) {
	this.addFiles( files );
	this.save();
}

Config.prototype.addFiles = function( files, path ) {
	var filename;
	for( var i = 0, n = files.length; i < n; i++ ) {
		filename = files[ i ];
		if( utils.isDirectory( filename ) ) {
			this.addFiles( fs.readdirSync( this.folder.path + "/" + filename ), filename + "/" );
			continue;
		}
		if( path ) {
			this.add( path + filename, true );
		} else {
			this.add( filename, true );
		}
	}
}

Config.prototype.add = function( filename, andQuit ) {
	if( filename == "component.json" ) {
		return;
	}

	var type = utils.getType( filename );

	if( !this.json[ type ] ) {
		this.json[ type ] = [];
	}

	if( this.json[ type ].indexOf( filename ) < 0 ) {
		this.json[ type ].push( filename );
	}

	if( !andQuit && this.save() ) {
		cutils.log( "added", filename );
	}
}

Config.prototype.remove = function( filename ) {
	if( filename == "component.json" ) {
		return;
	}

	var type = utils.getType( filename );

	if( !this.json[ type ] ) {
		return;
	}

	var idx = this.json[ type ].indexOf( filename );
	if( idx >= 0 ) {
		this.json[ type ].splice( idx, 1 );
	}

	if( this.save( filename ) ) {
		cutils.log( "removed", filename );
	}
}

Config.prototype.save = function() {
	err = fs.writeJsonSync( this.jsonPath, this.json );
	if( err ) cutils.fatal( err );
	return true;
}