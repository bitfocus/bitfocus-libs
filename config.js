var debug = require('debug')('config');
var fs    = require('fs');

module.exports = exports = function (system, defaults) {
	return new config(system, defaults);
};

function config(system, defaults) {
	var self = this;

	self.store = {};
	self.defaults = defaults;

	fs.readFile('../config', function (err, data) {

		if (err && err.code == 'ENOENT') {
			console.log("sef",self.defaults);
			self.store = self.defaults;
			system.emit('config_loaded', self.store);
			system.emit('config_save');
			return;
		};

		if (err) throw err;

		self.store = JSON.parse(data);
		debug('config loaded');
		system.emit('config_loaded', self.store);

	});

	system.on('config_get', function (key, cb) {
		debug('config_get(' + key + ')');
		cb(self.store[key]);
	});

	system.on('config_save', function () {

		fs.writeFile('../config', JSON.stringify(self.store), function (err) {

			if (err) {
				debug('Error saving: ', err);
				system.emit('config_saved', err);
				return;
			}

			debug('config written');
			system.emit('config_saved', null);

		});

	});

	system.on('config_set', function (key, value) {
		debug('config_set(' + key + ')');
		self.store[key] = value;
		system.emit("config_save");
	});

};
