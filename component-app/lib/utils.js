var fs = require( "fs" );
var p = require( "path" );

/*
 * Folder detection based on name.
 * If necessary, switch to fs.readFile and check if not undefined.
 */
exports.isDirectory = function( filename ) {
	return filename.indexOf( "." ) == -1;
}

hasConfig =
exports.hasConfig = function( path ) {
	try {
		fs.openSync( path + "/component.json", "r" );
		return true;
	} catch( err ) {
		return false;
	}
}

exports.canHaveConfig = function( path ) {
	if( !hasConfig( p.dirname( path ) ) && !hasConfig( path ) )
		return true;
	return false;
}

/*
 * Return the path folder to of the nearest file config container.
 * Only 1 depth for now. (need to be tested to see if need of evolution).
 */
exports.getRelatedConfigPath = function( path ) {
	if( hasConfig( path ) )
		return path;
	path = p.dirname( path );
	if( hasConfig( path ) )
		return path;
	return null;
}

exports.getFilenameWithRelativePath = function( basePath, toPath, filename ) {
	if( basePath == toPath ) {
		return filename;
	}
	var length = toPath.length;
	var folderName = basePath.substr( length + 1 );
	return folderName + "/" + filename;
}

exports.getType = function( filename ) {
	var type = "";

	var ext = p.extname( filename );
	switch( ext ) {
		case ".png":
		case ".jpg":
		case ".jpeg":
		case ".gif":
			type = "images";
			break;

		case ".styl":
		case ".css":
		case ".scss":
		case ".sass":
			type = "styles";
			break;

		case ".html":
		case ".jade":
			type = "templates";
			break;

		case ".coffee":
		case ".js":
			type = "scripts";
			break;
	}

	return type;
}