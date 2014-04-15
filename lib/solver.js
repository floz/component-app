
var requireRegexpTest = /require\s*\(*\s*["']([^'"\s]+)["']\s*\)*/;
var requireRegexp = /require\s*\(*\s*["']([^'"\s]+)["']\s*\)*/g;
var stringRegexp = /["']([^'"\s]+)["']/g;
var stringCharsRegexp = /["']/g;
var localRegexp = /\.\//g;

exports.hasRequire = function( string ) {
	return requireRegexpTest.test( string );
}

exports.getNames = function( string ) {
	var matchs = string.match( requireRegexp );

	var results = [];
	var stringName, name;
	for( var i = 0, n = matchs.length; i < n; i++ ) {
		stringName = matchs[ i ].match( stringRegexp )[ 0 ];
		name = stringName.replace( stringCharsRegexp, "" );
		if( !localRegexp.test( name ) ) {
			results.push( name );
		}
	}

	return results;
}