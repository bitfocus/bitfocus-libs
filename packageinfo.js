var debug = require('debug')('packageinfo');
var fs    = require('fs');
var parser = require('json-parser');

module.exports = exports = function (system) {
	return packageinfo(system);
};

function packageinfo(system) {
	var self = this;
	var fileContents = fs.readFileSync(__dirname + '/../package.json');
  var object = parser.parse(fileContents);
	return object;
};
