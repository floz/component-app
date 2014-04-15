var fs = require( "fs" );
var	events = require( "events" );
var	_ = require( "underscore" );
var generate = require( "./generate" );
var utils = require( "./utils" );
var Config = require( "./config" );

var ignores = [ ".DS_Store" ];

var foldersByPath = {};

module.exports = Folder;

function Folder( path ) {
	this.path = path;
	this.watcher = fs.watch( this.path, this.onFileUpdate.bind( this ) );
	this.config = null;
	this.files = null;
	this.updateFiles();
	this.generateConfig();

	foldersByPath[ this.path ] = this;
}

Folder.prototype.__proto__ = events.EventEmitter.prototype;

Folder.prototype.onFileUpdate = function( e, filename ) {
	if( ignores.indexOf( filename ) >= 0 ) {
		return;
	}

	if( e == "change" ) {
		this.emit( "changed", filename );
	} else if ( e == "rename" ) {
		if( this.files.indexOf( filename ) == -1 ) {
			var removed = this.updateFiles();
			if( removed.length ) {
				this.emit( "removed", removed );
			}
			this.emit( "added", filename );
		} else {
			try {
				var file = fs.openSync( this.path + "/" + filename, "r" );
				if( file ) {
					this.emit( "changed", filename );
				} else {
					console.log( "Non handled behavior for this file: " + file, "-- details:", e, filename, this.path );
				}
			} catch( err ) { 
				this.emit( "removed", this.updateFiles() );
			}
		}
	}
}

Folder.prototype.updateFiles = function() {
	var olds = this.files;
	this.files = fs.readdirSync( this.path );
	return _.difference( olds, this.files );
}

Folder.prototype.generateConfig = function() {
	if( !this.hasFiles() || this.config )
		return;

	if( utils.canHaveConfig( this.path ) ) {
		generate( this.path );
		this.config = new Config( this );
	} else {
		if( utils.hasConfig( this.path ) ) {
			this.config = new Config( this );
		}
	}
	if( this.config ) {
		this.config.init( this.files );
	}
}

Folder.prototype.hasFiles = function() {
	for( var i = 0, n = this.files.length; i < n; i++ ) {
		if( !utils.isDirectory( this.files[ i ] ) ) {
			return true;
		}
	}
	return false;
}

Folder.prototype.getFilePath = function( filename ) {
	return this.path + "/" + filename;
}

Folder.prototype.close = function() {
	if( this.config ) {
		this.config.dispose();
	}
}