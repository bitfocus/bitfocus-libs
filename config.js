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

	var config_file = cfgDir + '/config';

	if (!fs.existsSync(cfgDir)) {
		debug("no config dir exists. creating:",cfgDir);
		fs.mkdirSync(cfgDir);
	}

	if (fs.existsSync(config_file)) {
		debug(config_file,"exists. trying to read");
		var data = fs.readFileSync(config_file);
		try {
			self.store = JSON.parse(data);
			debug("parsed JSON");
		} catch(e) {
			self.store = {};
			debug("going default");
		}
		system.emit('config_loaded', self.store);
	}
	else {
		debug(config_file,"didnt exist. loading blank");
		system.emit('config_loaded', {} );
	}

};
