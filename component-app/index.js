var gaze = require( "gaze" );
var	fs = require( "fs" );
var	globule = require( "globule" );
var	component = require( "component" );
var	utils = require( "./lib/utils" );
var	Folder = require( "./lib/folder" );
var generate = require( "./lib/generate" );
var	cutils = component.utils;
var p = require( "path" );

var options = {
	app: "app"
};

var folders = [];
var foldersByPath = {};

var basePath = process.cwd() + "/" + options.app;
var paths = globule.find( basePath + "/**/*" );
paths.push( basePath );

for( var i = 0, n = paths.length; i < n; i++ ) {
	if( fs.lstatSync( paths[ i ] ).isDirectory() ) {
		add( paths[ i ] );
	}
}

function add( path ) {
	var folder = new Folder( path );
	folder.on( "added", function( filename ) {
		if( utils.isDirectory( filename ) ) {
			add( path + "/" + filename );
		} else {
			var relatedConfigPath = utils.getRelatedConfigPath( path );
			var folderToUpdate = foldersByPath[ relatedConfigPath ];
			if( folderToUpdate == null ) {
				folder.generateConfig( true );
				folderToUpdate = folder;
			}
			filename = utils.getFilenameWithRelativePath( path, relatedConfigPath, filename );
			folderToUpdate.config.add( filename );
		}
	});	
	folder.on( "changed", function( filename ) {
		console.log( "changed", path, filename );
		var ext = p.extname( filename );
		if( ext == ".js" || ext == ".coffee" ) {
			console.log( "check require et mettre a jour les dependances" );
		}
	});
	folder.on( "removed", function( filenames ) {
		var filename;
		for( var i = 0, n = filenames.length; i < n; i++ ) {
			filename = filenames[ i ];
			if( utils.isDirectory( filename ) ) {
				console.log( "remove directory", filename );
				close( foldersByPath[ folder.getFilePath( filename ) ] );
			} else {
				console.log( "remove file", filename );
				var relatedConfigPath = utils.getRelatedConfigPath( path );
				var folderToUpdate = foldersByPath[ relatedConfigPath ];
				if( folderToUpdate == null ) {
					return;
				}
				filename = utils.getFilenameWithRelativePath( path, relatedConfigPath, filename );
				folderToUpdate.config.remove( filename );
				// folder.removeFile( filename );
			}
		}
	});
	folders.push( folder );
	foldersByPath[ path ] = folder;
}

function close( folder ) {
	folder.removeAllListeners( "added" );
	folder.removeAllListeners( "changed" );
	folder.removeAllListeners( "removed" );
	folder.watcher.close();

	folders.splice( folders.indexOf( folder ), 1 );
}

// keep the process alive
setInterval( function(){}, 500 );