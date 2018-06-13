import {writeFileSync} from 'fs';
import execa from 'execa';
import shell from 'shelljs';
import test from 'ava';
import padStart from 'pad-start';

const t = new Date();
const today = `${padStart(String(t.getDate()), 2, '0')}/${padStart(String(t.getMonth() + 1), 2, '0')}/${t.getFullYear()}`;

const fixtureMarkdown = [
	'# **1.0.0** - ' + today + ' \n',
	'### **CSS**',
	'  * IE11 💩 flexbox issue\n\n',
	'### **Core**',
	'  * Minor tweeks',
	'  * Implement global event bus\n\n',
	'### **Event**',
	'  * Remove an internal argument\n\n',
	'### **Others**',
	'  * Hideable commit',
	'  * Another commit\n\n'
].join('\n');

const fixtureMarkdownStrip = [
	'# **1.0.0** - ' + today + ' \n',
	'### **CSS**',
	'  * IE11 💩 flexbox issue\n\n',
	'### **Core**',
	'  * Minor tweeks',
	'  * Implement global event bus\n\n',
	'### **Event**',
	'  * Remove an internal argument\n\n',
	'### **Others**',
	'  * Another commit\n\n'
].join('\n');

const fixtureSlack = [
	'*1.0.0* - ' + today + ' \n',
	'_CSS_',
	'  • IE11 💩 flexbox issue\n\n',
	'_Core_',
	'  • Minor tweeks',
	'  • Implement global event bus\n\n',
	'_Event_',
	'  • Remove an internal argument\n\n',
	'_Others_',
	'  • Hideable commit',
	'  • Another commit\n\n'
].join('\n');

const fixtureSlackStrip = [
	'*1.0.0* - ' + today + ' \n',
	'_CSS_',
	'  • IE11 💩 flexbox issue\n\n',
	'_Core_',
	'  • Minor tweeks',
	'  • Implement global event bus\n\n',
	'_Event_',
	'  • Remove an internal argument\n\n',
	'_Others_',
	'  • Another commit\n\n'
].join('\n');

test.before('Set up the test', () => {
	shell.config.silent = true;
	shell.rm('-rf', 'tmp');
	shell.mkdir('tmp');
	shell.cd('tmp');
	shell.exec('git init');

	shell.exec('git config --local user.name "Buddy-CI"');
	shell.exec('git config --local user.email "test@example.org"');
	shell.exec('git remote add origin git@github.com:picodix/changelist.git');

	writeFileSync('test1', '');
	shell.exec('git add --all && git commit -m "core: Implement global event bus"');
	writeFileSync('test2', '');
	shell.exec('git add --all && git commit -m "CSS: IE11 💩 flexbox issue"');
	writeFileSync('test3', '');
	shell.exec('git add --all && git commit -m "Event: Remove an internal argument"');
	writeFileSync('test4', '');
	shell.exec('git add --all && git commit -m "Core: minor tweeks"');
	writeFileSync('test5', '');
	shell.exec('git add --all && git commit -m "Another commit"');
	writeFileSync('test6', '');
	shell.exec('git add --all && git commit -m "0.19.0"');
	writeFileSync('test7', '');
	shell.exec('git add --all && git commit -m "Changelog 0.19.0"');
	writeFileSync('test8', '');
	shell.exec('git add --all && git commit -m "0.19.0 Changelog"');
	writeFileSync('test9', '');
	shell.exec('git add --all && git commit -m "hideable commit"');
});

test.after('cleanup', () => {
	shell.cd('..');
	shell.rm('-rf', 'tmp');
});

// Markdown preset test
test('Changelog - markdown preset', async t => {
	const {stdout} = await execa('../cli.js', ['-r=1.0.0']);
	t.is(stdout, fixtureMarkdown);
});

test('Changelog - markdown preset with stripped commit', async t => {
	const {stdout} = await execa('../cli.js', ['-r=1.0.0', '-i=hideable commit']);
	t.is(stdout, fixtureMarkdownStrip);
});

// Slack preset test
test('Changelog - slack preset', async t => {
	const {stdout} = await execa('../cli.js', ['-r=1.0.0', '-p=slack']);
	t.is(stdout, fixtureSlack);
});

test('Changelog - slack preset with stripped commit', async t => {
	const {stdout} = await execa('../cli.js', ['-r=1.0.0', '-p=slack', '-i=hideable commit']);
	t.is(stdout, fixtureSlackStrip);
});

test('Changelog - prepend output to file with no option (default to CHANGELOG.md)', async t => {
	// Store config option
	const option = 'CHANGELOG.md';

	// Run cli command (async)
	await execa('../cli.js', ['-r=1.0.0', '-o']);

	// Test if file has been created with default (CHANGELOG.md)
	t.is(shell.test('-f', `./${option}`), true);

	// We are testing that the file contains at least the version
	// and date. Ideally we should test the integrity of the entire stdout
	t.not(shell.grep(`1.0.0`, `./${option}`), '');
	t.not(shell.grep(`${today}`, `./${option}`), '');
});

test('Changelog - prepend output to file with passed file option', async t => {
	// Store config option
	const option = 'TEST.md';

	// Run cli command (async)
	await execa('../cli.js', ['-r=1.0.0', `-o=${option}`]);

	// Test if file has been created with passed option (TEST.md)
	t.is(shell.test('-f', `./${option}`), true);

	// We are testing that the file contains at least the version
	// and date. Ideally we should test the integrity of the entire stdout
	t.not(shell.grep(`1.0.0`, `./${option}`), '');
	t.not(shell.grep(`${today}`, `./${option}`), '');
});

test('Changelog - prepend output to file with nested folder structure file', async t => {
	// Store config option
	const option = './foo/bar/TEST.md';

	// Run cli command (async)
	await execa('../cli.js', ['-r=1.0.0', `-o=${option}`]);

	// Test if file has been created with passed nested foldr structure (./foo/bar/TEST.md)
	t.is(shell.test('-f', option), true);

	// We are testing that the file contains at least the version
	// and date. Ideally we should test the integrity of the entire stdout
	t.not(shell.grep(`1.0.0`, option), '');
	t.not(shell.grep(`${today}`, option), '');
});
