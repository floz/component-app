var p = require( "path" );
var fs = require( "fs-extra" );
var utils = require( "./utils" );
var cutils = require( "component" ).utils;
var components = require( "./components" );
var solver = require( "./solver" );
var _ = require( "underscore" );

var types = [ "images", "scripts", "templates", "styles" ];

module.exports = Config;

function Config( folder ) {
	this.folder = folder;
	this.fileList = [];
	this.jsonPath = this.folder.path + "/component.json";
	this.json = require( this.jsonPath );

	components.add( this.json.name, this.folder.path );
}

Config.prototype.init = function( files ) {
	this.addFiles( files );
	this.removeObsoleteFiles();
}

Config.prototype.updateRequires = function( andSave ) {
	if( this.updateDependencies() && andSave ) {
		if( this.save() ) {
			cutils.log( "updated dependencies", this.json.name );
		}
	}
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

Config.prototype.updateDependencies = function() {
	var names = getDependenciesNames( this.json.scripts, this.folder.path );

	var name, path;
	var locals = [], paths = [], deps = {};
	for( i = 0, n = names.length; i < n; i++ ) {
		name = names[ i ];
		path = components.getPath( name );
		if( path ) {
			locals.push( name );
			if( this.folder.path ) {
				path = p.relative( this.folder.path, path );
			}
			paths.push( path );
		} else {
			path = components.getGlobalPath( name );
			if( path ) {
				deps[ path ] = "*";
			} else {
				cutils.warn( "dependency not found", name );
			}
		}
	}

	paths = _.uniq( paths );

	var hasLocalDiffs = _.difference( locals, this.json.local ).length;
	var hasDepsDiffs = !_.isEqual( deps, this.json.dependencies );

	if( !hasLocalDiffs && !hasDepsDiffs ) {
		return false;
	}
	this.json.dependencies = deps;
	this.json.local = locals;
	this.json.paths = paths;
	return true;
}

function getDependenciesNames( scripts, path ) {
	var script;
	var names = [];
	for( var i = 0, n = scripts.length; i < n; i++ ) {
		script = fs.readFileSync( path + "/" + scripts[ i ], "utf8" );
		if( solver.hasRequire( script ) ) {
			names = names.concat( solver.getNames( script ) );
		}
	}
	return names;
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

Config.prototype.dispose = function() {
	components.remove( this.json.name );
	cutils.warn( "removed component", this.json.name );
}