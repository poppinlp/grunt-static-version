# Grunt-static-version

[![Build Status](https://travis-ci.org/poppinlp/grunt-static-version.png?branch=master)](https://travis-ci.org/poppinlp/grunt-static-version)
[![Dependency Status](https://david-dm.org/poppinlp/grunt-static-version.svg)](https://david-dm.org/poppinlp/grunt-static-version)
[![devDependency Status](https://david-dm.org/poppinlp/grunt-static-version/dev-status.svg)](https://david-dm.org/poppinlp/grunt-static-version#info=devDependencies)

Grunt task to update static resource version in html file.

__The configuration for 0.1.x and 0.2.x are not compatible. If you wanna use 0.1.x, see tag 0.1.2.__

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

### src {String|Array|Glob}

__Required.__

Source path. Support file path, glob and globs.

### dest {String}

Output path. Will write result to path like `path.join(dest, fileName)`.

### options.output {String}

Default: `md5`.

Define which way to setting version. Value could be 'timestamp' or 'md5'.

In 'md5' way, path will be like this: filename.md5.suffix . And will auto create the md5 named file in the same directory.

In 'timestamp' way, path will be like this: filename?timestamp .

### options.symbol {String}

Default: `<!--##-->`.

The wrap symbol use to wrap resource which need to add version code. Such as:

```html
<link rel="stylesheet" href="<!--##-->css/index.css<!--##-->">
```

### options.baseDir {String}

Default: `./`.

The static resource base directory. Resource final path is `baseDir` + path in wrap symbol.

### options.cdn {Function}

Default: `undefined`

Push static resource to your CDN and use `cdnDomain` option and this return path to load that resource.

The arguments for `cdn` function are file name and callback function.
Error message and CDN return url would be arguments for callback function, like `function (err, ret)`.
There are some [cdn-adapter](https://www.npmjs.com/search?q=static-version-cdn) packages for this option, and you could create your adapter if you want.

See example below.

### options.cdnDomain {String}

Default: ``.

If `cdn` option is specified, this will be the domain for request url.

### options.warn {Boolean}

Default: `false`.

Whether to print warn message or not.

## Usage Examples

### Basic

```js
// Project configuration
"static-version": {
	dist: {
		options: {
			baseDir: 'path/to/base/dir/',
			output: 'ts'
		},
		src: 'test/foobar.html'
	}
}
```

### Use src array and glob

```js
// Project configuration
'static-version': {
    dist: {
		src: [
			'path/1.html',
			'path/to/*.html',
			'path/to/foobar/**/*.html',
		]
	}
}
```

### Use qiniu CDN

```js
'static-version': {
    dist: {
		options: {
			cdn: require('static-version-cdn-qiniu')({
				ak: 'xxxxxx',
				sk: 'xxxxxx',
				bucket: 'bucketName',
				prefix: 'foobar/'
			}),
			cdnDomain: 'http://xxx.yyy'
		},
		src: [
			'path/1.html',
			'path/to/*.html',
			'path/to/foobar/**/*.html',
		]
	}
}
```

__You could write your own adapter to push file to your CDN service.__

## Demo

Run the test demo:

```shell
grunt test
```

## History

- 0.2.3
	- Bugfix
	- Update test case
- 0.2.1
	- Change `dest` option to non-essential. So if it not set, task will rewrite the src file.
- 0.2.0
	- Add `dest` option for output result
	- Support push file to CDN
	- Reconstruct all task
- 0.1.2 Bug fix
- 0.1.0 Reconstruction.
