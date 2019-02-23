'use strict';

const path = require('path');
const chalk = require('chalk');
const stripEof = require('strip-eof');
const H = require('./helpers');

module.exports = function (opts) {
	opts = opts || {};
	H.verbose = opts.verbose;
	H.name = opts.name;

	H.section('Checking git repository');
	H.checkGitExec();

	let base = opts.base && opts.base.trim();
	if (base) {
		base = path.resolve(process.cwd(), base);
		H.checkDirectory(base);
		H.log('Changing working directory to ' + chalk.cyan(base) + '.');
		process.chdir(base);
	} else {
		H.log('Using the current working directory as the base.');
	}

	H.checkGitRepo();

	H.section('The following commit messages will be ignored');
	const ignores = opts.ignore;
	if (ignores) {
		const ignoreList = ignores.split(',');
		for (let index = 0; index < ignoreList.length; index++) {
			H.log(chalk.cyan(ignoreList[index]));
		}
	}

	H.section('Checking preset');

	const preset = opts.preset ? opts.preset.trim() : 'markdown';
	let formater;
	if (preset) {
		try {
			formater = require('./presets/' + preset.toLowerCase());
		} catch (error) {
			H.error('ERROR: Preset `' + preset + '` doesn\'t exist', 1);
		}

		H.log('Using ' + preset + ' preset.');
	} else {
		H.log('Using default preset.');
		formater = H.format;
	}

	H.section('Gathering commits');

	const commitish = opts.commitish ? opts.commitish.trim() : '';
	const commits = H.getLog(commitish, formater.format).split(/\r?\n/);

	H.section('Generating changelog');

	let output = H.getHeader(formater.header, H.getVersion(opts.release));
	output += formater(commits, opts.ignore);

	// Check if the option to write in file has been set
	if (Object.prototype.hasOwnProperty.call(opts, 'output')) {
		const fileOutput = opts.output ? opts.output.trim() : 'CHANGELOG.md';
		H.prependToFile(fileOutput, output);
	}

	H.log(chalk.green('Done!') + '\n');

	return stripEof(output);
};
