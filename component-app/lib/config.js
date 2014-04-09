var p = require( "path" );
var fs = require( "fs-extra" );
var utils = require( "./utils" );
var cutils = require( "component" ).utils;

var types = [ "images", "scripts", "templates", "styles" ];

module.exports = Config;

function Config( folder ) {
	this.folder = folder;
	this.fileList = [];
	this.jsonPath = this.folder.path + "/component.json";
	this.json = require( this.jsonPath );
}

Config.prototype.init = function( files ) {
	this.addFiles( files );
	this.removeObsoleteFiles();
	
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
			filename = path + filename;
		}

		this.add( filename, true );
		this.fileList.push( filename );
	}
}

Config.prototype.removeObsoleteFiles = function() {
	var type
	var filesByType;
	
	var j = 0;
	for( var i = 0, n = types.length; i < n; i++ ) {
		type = types[ i ];

		filesByType = this.json[ type ];
		if( !filesByType ) {
			continue;
		}
		
		j = filesByType.length;
		while( --j > -1 ) {
			if( this.fileList.indexOf( filesByType [ j ] ) >= 0 ) {
				continue;
			}
			this.json[ type ].splice( j, 1 );
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
		this.fileList.push( filename );
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