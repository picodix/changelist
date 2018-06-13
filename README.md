# changelist

> Generate a simple changelog for your release based on git commit history.

&nbsp;
# Install

```
$ npm install -g changelist
```

&nbsp;
# Usage

```
$ changelist --help

Usage
    $ changelist

Options
    -b, --base       Specify the path of the git repo. By default, all file paths
                     are relative to process.cwd()
    -p, --preset     The preset to use for changelist export.
                     You can choose `slack` and `markdown` presets.
                     If no preset is specified, then a simple markdown changelist will be generated.
    -c, --commitish  The commit-ish from which you want to generate the changelist.
                     Default to [latest-tag]..HEAD.'
    -r, --release    The version of the upcoming release. If not specified, the cli
                     will read the version from `package.json`.
    -i, --ignore     A list of commit messages you want to mask in the changelist.
    -o, --output     Define a file to write the changelist output to (will be prepended to the file)
                     default to CHANGELOG.md
    -N, --name       Generate a random name for the release
    -V, --verbose    Output more detailed information
    -h, --help       Display this notice

Examples
    $ changelist
    $ changelist --base /home/github/changelist
    $ changelist -c 1.0.0..HEAD -r 1.0.1
```

&nbsp;
# Features

- custom presets
- ignore commit with specific message
- prepend output to file
- generate release name

&nbsp;
## Using different presets

If you don't want to export the changelist using markdown format you can change the preset used by using the `preset` command like so:
```
changelist -p slack
```
This will use a preset for Slack-compliant changelist export.
Available presets:
- `markdown`: default markdown export
- `slack`: a slack friendly changelist export (using [slack message formatting](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages))

&nbsp;

## Remove commit with specific message or commit you are ashamed of

We are humans and sometimes we can do stuff we are not proud of. If you want/need to mask commit containing a certain message from your export, you can use the `ignore` option like so:

```
$ changelist -i 'jobs... steve jobs'
```

> NOTE: if you need to hide several commits in the changelist (yeah sometime shit happens) it's also possible using comma separated values:

```
$ changelist -i 'jobs... steve jobs','gave up and used table','all sorts of things'
```

&nbsp;

## Prepend output to file

```
$ changelist -o TEST.md
```

Will prepend the output of the command to a `TEST.md` file (and create the file if missing).

> NOTE: the ouput folder will follow the exact path you entered meaning that you could do something like:

```
$ changelist -o ./foo/bar/TEST.md
```

> This will create the folders recursively if they are missing or simply use the existing file otherwise.

&nbsp;
## Write output into a CHANGELOG.md file in bash/sh

If you need to prepend the result of the changelist command in a file, you can simply do:

```
$ echo -e "$(changelist)\n\n$(cat CHANGELOG.md)" > CHANGELOG.md
```

&nbsp;
## Name generation

If you want your release to have a fancy name on top of a number simply pass the `-N` flag like so:
```
$ changelist -N
```
This will give you cool names like `Repulsive Chirogymnast`, `Kernelless Reestimation` or `Overtrustful Japygid`.
Why? Because it's fun. And it's important to have fun.

&nbsp;
## Todo
- [ ] Add tests
- [ ] Add `Jira` integration (update flagged ticket).
- [x] Add documentation
- [x] Add cli options for auto generate a release name (available under a `--N` flag)
- [x] Add an ignore option to mask a list of commit containing specific message.
- [x] Add option to write output directly to the `CHANGELOG.md` file (from Node.js)

