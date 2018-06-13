#!/usr/bin/env node

'use strict';

const meow = require('meow');
const changelog = require('./main');

const cli = meow({
	help: [
		'Usage',
		'    $ changelog',
		'',
		'Options',
		'    -b, --base       Specify the path of the git repo. By default, all file',
		'                     paths are relative to process.cwd().',
		'    -p, --preset     The preset to use for changelog export.',
		'                     You can choose `slack` and `markdown` presets.',
		'                     If no preset is specified, then a simple markdown changelog will be generated',
		'    -c, --commitish  The commit-ish from which you want to generate the',
		'                     changelog. Default to [latest-tag]..HEAD.',
		'    -r, --release    The version of the upcoming release. If not specified,',
		'                     the cli will read the version from `package.json`.',
		'    -i, --ignore     A list of commit message you want to mask in the changelog.',
		'    -o, --output     Define a file to write the changelog output to (will be prepended to the file)',
		'                     default to CHANGELOG.md',
		'    -N, --name       Generate a random name for the release',
		'    -V, --verbose    Output more detailed information.',
		'    -h, --help       Display this notice.',
		'',
		'Examples',
		'    $ changelog',
		'    $ changelog --base /home/github/changelist',
		'    $ changelog -c 1.0.0..HEAD -r 1.0.1'
	]
}, {
	alias: {
		b: 'base',
		p: 'preset',
		c: 'commitish',
		h: 'help',
		r: 'release',
		i: 'ignore',
		o: 'output',
		V: 'verbose',
		N: 'name'
	},
	string: ['base', 'preset', 'commitish', 'release', 'ignore', 'output'],
	boolean: ['verbose', 'name']
});

console.log(changelog(cli.flags));
