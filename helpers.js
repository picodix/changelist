#!/usr/bin/env node

'use stict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const readPkg = require('read-pkg-up').sync;
const semver = require('semver');
const stripEof = require('strip-eof');
const padStart = require('pad-start');
const prependFile = require('prepend-file');
const fx = require('mkdir-recursive');

module.exports = {
	capitalize: function (str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	checkDirectory: function (dir) {
		try {
			fs.statSync(dir);
		} catch (error) {
			this.error(`no such file or directory: ${dir}`, 1);
		}

		if (!fs.statSync(dir).isDirectory()) {
			this.error(`not a directory: ${dir}`, 1);
		}
	},

	checkGitExec: function () {
		this.exec('git --version', {stdio: 'ignore'}, 'Missing required executable: git');
	},

	checkGitRepo: function () {
		this.log(`Checking if "${chalk.cyan(process.cwd())}" is a Git repository ...`);
		this.exec('git rev-parse', {stdio: ['ignore', 'ignore', 'pipe']});
	},

	error: function (msg, code) {
		const err = chalk.red.bold;
		console.log(err(msg));
		console.log(err('Aborting.'));
		process.exit(code);
	},

	exec: function (cmd, opts, msg) {
		try {
			const rs = execSync(cmd, opts);
			return rs && stripEof(rs).toString();
		} catch (error) {
			this.error(msg || stripEof(error.stderr).toString().split(/\r?\n/)[0], error.status || 1);
		}
	},

	format: function (commits, symbol = '*') {
		return commits.map(commit => {
			return `  ${symbol} ${commit}`;
		}).join('\n') + '\n\n';
	},

	getHeader: function (header, release) {
		const name = this.name ? this.getReleaseName() : '';
		header = header || '@RELEASE - @DATE @NAME\n\n';
		return header
			.replace('@RELEASE', release)
			.replace('@NAME', (name ? `(codename \`${name}\`)` : ''))
			.replace('@DATE', this.today());
	},

	getHomePage: function () {
		let originUrl = this.exec('git config --get remote.origin.url');
		/* eslint no-useless-escape: 0 */
		const regex = /^git@[^:]+:[^\/]+\/.+/i;

		if (regex.test(originUrl)) {
			originUrl = originUrl
				.replace(':', '/')
				.replace('git@', 'https://');
		}

		return originUrl.replace('.git', '/');
	},

	getReleaseName: function () {
		const releaseName = this.exec('curl https://futureboy.us/lookup/codename.pl?count=1');
		const regex = /<P><B>(.*?)<\/B><\/P>/g;
		return releaseName.match(regex)[0].replace(/<{1}[^<>]{1,}>{1}/g, '');
	},

	getLog: function (commitish, format) {
		let tag;
		format = format || '%s';

		if (!commitish) {
			tag = this.getTag();
			commitish = tag && tag + '..HEAD';
		}

		this.log('Getting the list of commits...');

		const rs = this.exec('git log ' + commitish + ' --no-merges --pretty=format:"' + format + '"',
			{stdio: ['ignore', 'pipe', 'pipe']});
		if (!rs) {
			this.error('No commits found', 1);
		}

		return rs;
	},

	getTag: function () {
		let commithash;
		try {
			commithash = execSync('git rev-list --tags --max-count=1',
				{stdio: ['ignore', 'pipe', 'ignore']});
		} catch (error) {
			return '';
		}

		return this.exec('git describe --tags ' + commithash);
	},

	getVersion: function (release) {
		if (release) {
			if (semver.valid(release) === null) {
				this.warn('"' + release + '" is not valid semver. Using the one in `package.json`.\n');
			} else {
				return release;
			}
		}

		const pkg = readPkg().pkg;
		const version = pkg ? pkg.version : 'x.x.x';
		return version.replace('-pre', '');
	},

	getEligibleCommits: function (commits, ignores) {
		let component;
		const log = {};
		// Simple regex to extract commit category
		const regexCategory = /^([^:]+):/;
		// Last regex to detect if a commit contain a version number (and if so, ignore it)
		const regexVersionNumber = new RegExp(/\d+(\.\d+)+/);
		// Split commit messages to ignore and lower case everything
		const whiteList = (ignores) ? ignores.split(',').map(v => v.toLowerCase()) : null;

		commits.forEach(commit => {
			// This test if commit is prefixed with a type
			// for example: init: first blood
			if (regexCategory.test(commit)) {
				component = this.capitalize(regexCategory.exec(commit)[1]);
				commit = commit.replace(regexCategory, '').trim();
			} else if (regexVersionNumber.test(commit)) {
				// Test if a commit contain a version number and simply add them
				// to a temporary "Ignore" array (won't be spitted in output)
				component = 'Ignore';
			} else {
				// By setting the label in lower case we are forcing this item
				// to be ordered at the last position when sorting object keys
				component = 'others';
			}

			if (!log[component]) {
				log[component] = [];
			}

			// Only add commit to the export if it doesn't match the optional
			// passed white list (ignore option)
			if (!whiteList || whiteList.indexOf(commit.trim().toLowerCase()) === -1) {
				commit = this.capitalize(commit);
				log[component].push(commit.trim());
			}
		});

		return log;
	},

	section: function (sect) {
		this.log();
		this.log(chalk.blue.bold('→ ') + chalk.magenta(sect));
		this.log();
	},

	log: function (msg) {
		if (!this.verbose) {
			return;
		}

		console.log(msg || '');
	},

	prependToFile: function (file, data) {
		const pathToFileOutput = path.resolve(process.cwd(), file);
		// Test if path exist, if not make sure to create the all
		// folder structure recursively before adding the file
		if (!fs.existsSync(pathToFileOutput)) {
			fx.mkdirSync(path.dirname(pathToFileOutput));
		}

		// Prepend changelog item in passed file
		prependFile.sync(pathToFileOutput, data);
		// Friendly user input (only visible in verbose mode)
		this.log(chalk.blue.bold('→ ') + chalk.magenta(`Changelog has been prepended to ${file} \n`));
	},

	today: function () {
		const t = new Date();
		return `${padStart(String(t.getDate()), 2, '0')}/${padStart(String(t.getMonth() + 1), 2, '0')}/${t.getFullYear()}`;
	},

	warn: function (msg) {
		console.log(chalk.yellow('WARN: ' + msg));
	}
};
