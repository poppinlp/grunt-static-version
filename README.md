# Grunt-static-version

[![Build Status](https://travis-ci.org/poppinlp/grunt-static-version.png?branch=master)](https://travis-ci.org/poppinlp/grunt-static-version)
[![Dependency Status](https://david-dm.org/poppinlp/grunt-static-version.svg)](https://david-dm.org/poppinlp/grunt-static-version)
[![devDependency Status](https://david-dm.org/poppinlp/grunt-static-version/dev-status.svg)](https://david-dm.org/poppinlp/grunt-static-version#info=devDependencies)

Grunt task to update static resource version in html file.

## Getting Started

This plugin requires Grunt >=0.4.0

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-static-version --save
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-static-version');
```

## Static-version Task

_Run this task with the `grunt static-version` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### files.src {String|Array}

Source path. Support file path, glob and globs.

### files.baseDir {String}

The static resource base directory.

### files.filter {Object}

The options for glob in `files.src`. See [glob options](https://github.com/isaacs/minimatch#options) for more detail.

### files.ignore {Object}

Ignore the text between object key and value. It’s a good idea to use this with other templates.

Files linked by http, https, ftp or similar protocal will be auto ignore.

### files.output {String}

Define which way to setting version. Value could be 'timestamp' or 'md5'. Default is 'timestamp'.

In 'md5' way, path will be like this: filename.md5.suffix . And will auto create the md5 named file in the same directory.

In 'timestamp' way, path will be like this: filename?timestamp .

## Usage Examples

### Basic

```js
// Project configuration
'static-version': {
    dist: {
        files: {
            src: 'path/to/file.html',
            baseDir: 'base/dir/'
        }
    }
}
```

### Use glob and filter

```js
// Project configuration
'static-version': {
    dist: {
        files: {
            src: 'to/**/*.html',
            baseDir: 'base/dir/',
            filter: {
                cwd: 'path/'
            }
        }
    }
}
```

### Use ignore

```html
<script src="{{ template variable }}/path/to/file"></script>
```

```js
// Project configuration
'static-version': {
    dist: {
        files: {
            src: 'path/to/file.html',
            baseDir: 'base/dir/',
            ignore: {
                '{{': '}}'
            }
        }
    }
}
```

## Demo

Run the test demo:

```shell
grunt test
```

## History

- 0.0.9 Update [file-changed](https://github.com/poppinlp/file-changed) to 0.1.0
- 0.0.8 Bugfix
- 0.0.7 Reconstruction and use module [file-changed](https://github.com/poppinlp/file-changed)
- 0.0.6 Add output option
- 0.0.5 Bugfix
- 0.0.4 Update and bugfix
- 0.0.3 Bugfix
- 0.0.2 Add 'files.ignore' option
- 0.0.1 init
