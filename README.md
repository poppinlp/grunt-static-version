# Grunt-static-version

[![Build Status](https://travis-ci.org/poppinlp/grunt-static-version.png?branch=master)](https://travis-ci.org/poppinlp/grunt-static-version)
[![Dependency Status](https://david-dm.org/poppinlp/grunt-static-version.svg)](https://david-dm.org/poppinlp/grunt-static-version)
[![devDependency Status](https://david-dm.org/poppinlp/grunt-static-version/dev-status.svg)](https://david-dm.org/poppinlp/grunt-static-version#info=devDependencies)

Grunt task to update static resource version in html file.

## Getting Started

This plugin requires Grunt >=0.4.0

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-static-version --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-static-version');
```

## Static-version Task

_Run this task with the `grunt static-version` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### files.src

Source path. Support path pattern.

### files.baseDir

The static resource base directory.

### files.filter

The src file path filter.See [this page](https://github.com/isaacs/minimatch#options) for more options about filter.

## Usage Examples

### Basic

```js
// Project configuration
htmlhintplus: {
    dist: {
        files: {
            src: 'path/to/file.html',
            baseDir: 'base/dir/'
        }
    }
}
```

### Use pattern and filter

```js
// Project configuration
htmlhintplus: {
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

## Demo

Run the test demo:

```shell
grunt test
```

## History

- 0.0.1 init
