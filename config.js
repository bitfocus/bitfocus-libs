var debug = require('debug')('config');
var fs    = require('fs');

module.exports = exports = function (system, cfgDir, defaults) {
	return new config(system, cfgDir, defaults);
};

function config(system, cfgDir, defaults) {
	var self = this;

	self.store = {};
	self.defaults = defaults;



	system.on('config_object', function(cb) {
		debug("config_object()");
		cb(self.store);
	});

	system.on('config_get', function (key, cb) {
		debug('config_get(' + key + ')');
		cb(self.store[key]);
	});

	system.on('config_save', function () {
		debug("config_save(): begin");
		fs.writeFile(cfgDir + '/config', JSON.stringify(self.store), function (err) {
			debug("config_save(): writeFile callback");

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

	try {
		var data = fs.readFileSync(cfgDir + '/config');

		self.store = JSON.parse(data);
		debug('config loaded');
		system.emit('config_loaded', self.store);

	} catch (err) {

		debug("config construct(): catch err", err);
		debug("ERRCODE:", err.code)
		if (err && err.code == 'ENOENT') {
			debug("zomg");
			self.store = self.defaults;
			system.emit('config_loaded', self.store);
			system.emit('config_save');
			return;
		}

		if (err) throw err;
	}


};
