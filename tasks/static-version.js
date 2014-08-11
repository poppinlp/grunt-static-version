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
            currentFile,
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
                content;

            while (len--) {
                changed = false;
                currentFile = list[len];
                content = grunt.file.read(currentFile, { encoding: 'utf8' });
                content = checkFile('js', content);
                content = checkFile('css', content);
                if (changed) {
                    grunt.file.write(currentFile, content, { encoding: 'utf8' });
                    grunt.log.ok('Update static resource version for ' + currentFile + '.');
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
                    var file = path.normalize((files.baseDir || '') + path.sep + word.match(/".*?"/i)[0].slice(1, -1)),
                        timeInFile,
                        lastChange,
                        key, reg;

                    if (files.ignore) {
                        for (key in files.ignore) {
                            if (files.ignore.hasOwnProperty(key)) {
                                reg = new RegExp(key + '.*?' + files.ignore[key], 'ig');
                                file = file.replace(reg, '');
                            }
                        }
                    }
                    if (file.indexOf('?') !== -1) {
                        timeInFile = file.slice(-13);
                        file = file.slice(0, -14);
                    }
                    if (!grunt.file.exists(file)) {
                        grunt.log.warn('File not found: ' + file + ' in ' + currentFile);
                        return word;
                    }
                    lastChange = fs.statSync(file).mtime.getTime();
                    if (timeInFile) {
                        if (timeInFile === lastChange.toString()) {
                            return word;
                        } else {
                            changed = true;
                            return word.slice(0, -15) + '?' + lastChange + '"';
                        }
                    } else {
                        changed = true;
                        return word.slice(0, -1) + '?' + lastChange + '"';
                    }
                });
            });
        }
    });
};
