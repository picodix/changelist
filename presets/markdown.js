'use strict';

const H = require('../helpers');

const preset = function (commits, ignores) {
	let output = '';
	const log = H.getEligibleCommits(commits, ignores);

	Object.keys(log).sort().forEach(key => {
		// Generate export and make sure to ommit the ignore category
		if (key !== 'Ignore' && log[key].length > 0) {
			output += '### **' + H.capitalize(key) + '**\n' + H.format(log[key]) + '\n';
		}
	});

	return output;
};

preset.header = '# **@RELEASE** - @DATE @NAME\n\n';

module.exports = preset;
