/*
 * grunt-static-verion
 * https://github.com/poppinlp/grunt-static-version
 *
 * Copyright (c) 2014 "PoppinLp" Liang Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.registerTask('static-version', 'Update static resource version', function () {
        var config = grunt.config.get('static-version'),
            path = require('path'),
            fs = require('fs'),
            files,
            task,
            changed;

        for (task in config) {
            if (config.hasOwnProperty(task)) {
                files = config[task].files;
                doTask(grunt.file.expand(files.src));
            }
        }

        function doTask (list) {
            var len = list.length,
                content,
                key,
                reg;

            while (len--) {
                changed = false;
                content = grunt.file.read(list[len], { encoding: 'utf8' });
                if (files.ignore) {
                    for (key in files.ignore) {
                        if (files.ignore.hasOwnProperty(key)) {
                            reg = new RegExp(key + '.*?' + files.ignore[key], 'ig');
                            content = content.replace(reg, '');
                        }
                    }
                }
                content = checkFile('js', content);
                content = checkFile('css', content);
                if (changed) {
                    grunt.file.write(list[len], content, { encoding: 'utf8' });
                    grunt.log.ok('Update static resource version for ' + list[len] + '.');
                }
            }
        }

        function checkFile(type, content) {
            var fileReg, wordReg;

            if (type === 'js') {
                fileReg = /<script.*?src=".*?"/gi;
                wordReg = /src=".*?"/gi;
            } else {
                fileReg = /<link.*?href=".*?"/gi;
                wordReg = /href=".*?"/gi;
            }

            return content.replace(fileReg, function (word) {
                return word.replace(wordReg, function (word) {
                    var file = path.normalize(files.baseDir + path.sep + word.match(/".*?"/i)[0].slice(1, -1)),
                        lastChange;

                    if (file.indexOf('?') !== -1) {
                        lastChange = fs.statSync(file.slice(0, -14)).mtime.getTime();
                        return word.replace(/\?\d+"/gi, function (time) {
                            if (time.slice(1, -1) === lastChange.toString()) {
                                return time;
                            } else {
                                changed = true;
                                return '?' + lastChange + '"';
                            }
                        });
                    } else {
                        lastChange = fs.statSync(file).mtime.getTime();
                        changed = true;
                        return word.slice(0, -1) + '?' + lastChange + '"';
                    }
                });
            });
        }
    });
};
