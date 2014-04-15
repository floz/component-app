var	fs = require( "fs" );
var	globule = require( "globule" );
var	component = require( "component" );
var components = require( "./lib/components" );
var	utils = require( "./lib/utils" );
var	Folder = require( "./lib/folder" );
var generate = require( "./lib/generate" );
var	cutils = component.utils;
var p = require( "path" );

var options = {
	app: "app"
};

console.log( '  \033[' + 36 + 'm%s\033[m', "Watching..." );


// EXPOSE
var fnOnBuild;
module.exports = function( onBuild ) {
	fnOnBuild = onBuild;
	fnOnBuild.call( this, null );
}


components.addGlobals();

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

for( i = 0, n = folders.length; i < n; i++ ) {
	if( !folders[ i ].config )
		continue;
	folders[ i ].config.updateRequires( true );
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
		fnOnBuild.call( this, null );
	});	
	folder.on( "changed", function( filename ) {
		var ext = p.extname( filename );
		if( ext == ".js" || ext == ".coffee" ) {
			var folderToUpdate = getRelatedFolder( path );
			folderToUpdate.config.updateRequires( true );
		}
		fnOnBuild.call( this, null );
	});
	folder.on( "removed", function( filenames ) {
		var filename;
		for( var i = 0, n = filenames.length; i < n; i++ ) {
			filename = filenames[ i ];
			if( utils.isDirectory( filename ) ) {
				close( foldersByPath[ folder.getFilePath( filename ) ] );
			} else {
				var folderToUpdate = getRelatedFolder( path );
				if( folderToUpdate == null ) {
					return;
				}
				filename = utils.getFilenameWithRelativePath( path, relatedConfigPath, filename );
				folderToUpdate.config.remove( filename );
			}
		}
		fnOnBuild.call( this, null );
	});
	folders.push( folder );
	foldersByPath[ path ] = folder;
}

function getRelatedFolder( path ) {
	var relatedConfigPath = utils.getRelatedConfigPath( path );
	return foldersByPath[ relatedConfigPath ];
}

function close( folder ) {
	folder.removeAllListeners( "added" );
	folder.removeAllListeners( "changed" );
	folder.removeAllListeners( "removed" );
	folder.watcher.close();
	folder.close();

	folders.splice( folders.indexOf( folder ), 1 );
}

// keep the process alive
setInterval( function(){}, 500 );
