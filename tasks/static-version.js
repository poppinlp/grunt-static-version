/*
 * grunt-static-version
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
            crypto = require('crypto'),
            fc = require('file-changed'),
            loger = [],
            files,
            currentFile,
            changed,
            encoding = {
                encoding: 'utf8'
            };

        grunt.log.writeln(grunt.util.linefeed + 'Start task grunt-static-version...');

        for (var task in config) {
            if (config.hasOwnProperty(task)) {
                files = config[task].files;
                doTask(grunt.file.expand(files.src));
            }
        }

        grunt.log.oklns('Update static resource version successfully.');
        grunt.log.writeln('--------------------------------------------');

        var len = loger.length;
        if (!len) {
            grunt.log.errorlns('No file changed.');
        } else {
            while (len--) {
                grunt.log.oklns(loger[len]);
            }
        }

        grunt.log.writeln('--------------------------------------------');
        fc.save();


        function doTask (list) {
            var len = list.length,
                content;

            while (len--) {
                changed = false;
                currentFile = list[len];
                content = grunt.file.read(currentFile, encoding);
                content = checkFile('js', content);
                content = checkFile('css', content);
                if (changed) {
                    grunt.file.write(currentFile, content, encoding);
                    loger.push(currentFile);
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
                    var linkPath = word.match(/".*?"/i)[0].slice(1, -1);

                    // auto ignore web path like 'http[s]://filename', 'ftp://filename' e.t.c
                    if (linkPath.search(/^.*?:\/\/+.$/i) === 0) return word;

                    var filePath = path.normalize((files.baseDir || '') + '/' + linkPath),
                        key, reg;

                    // ignore from setting, use for template path such as '{{template variable}}/path/to/file' .
                    if (files.ignore) {
                        for (key in files.ignore) {
                            if (files.ignore.hasOwnProperty(key)) {
                                reg = new RegExp(key + '.*?' + files.ignore[key], 'ig');
                                filePath = filePath.replace(reg, '');
                            }
                        }
                    }

                    // output in timestamp or md5
                    if (!files.output || files.output !== 'md5') {
                        return doTS();
                    } else {
                        return doMd5();
                    }

                    function doTS() {
                        var lastChange, index;

                        // if there is a timestamp, remove it
                        index = filePath.indexOf('?');
                        if (index !== -1) {
                            filePath = filePath.slice(0, index);
                        }
                        // if can't find that file, log warn and return
                        if (!grunt.file.exists(filePath)) {
                            grunt.log.warn('File not found: ' + filePath + ' in ' + currentFile);
                            return word;
                        }
                        // decide to change it or not
                        lastChange = fc.get(filePath);
                        if (!lastChange) {
                            fc.addFile(filePath).update(filePath);
                            changed = true;
                            return word.slice(0, -1) + '?' + fc.get(filePath) + '"';
                        } else {
                            if (!fc.check(filePath).length) return word;
                            changed = true;
                            fc.update(filePath);
                            return word.slice(0, -15) + '?' + fc.get(filePath) + '"';
                        }
                    }

                    function doMd5() {
                        var index = filePath.lastIndexOf(path.sep) + 1,
                            relativePath = filePath.slice(0, index),
                            fileName = filePath.slice(index),
                            fileNameSplit = fileName.split('.'),
                            md5InFile = fileNameSplit.length === 3 ? fileNameSplit[1] : '',
                            originFileName = md5InFile ? fileNameSplit[0] + '.' + fileNameSplit[2] : fileName,
                            originFilePath = path.normalize(relativePath + '/' + originFileName);

                        // if can't find that file, log warn and return
                        if (!grunt.file.exists(originFilePath)) {
                            grunt.log.warn('File not found: ' + originFileName + ' in ' + currentFile);
                            return word;
                        }
                        // decide to change it or not
                        var md5Now = fc.get(originFilePath, 'md5'),
                            distFileName;

                        if (!md5Now) {
                            fc.addFile(originFilePath);
                        } else if (!fc.check(originFilePath).length) {
                            return word;
                        }

                        fc.update(originFilePath);
                        changed = true;
                        distFileName = fileNameSplit[0] + '.' + fc.get(originFilePath, 'md5') + '.' + fileNameSplit[fileNameSplit.length - 1];
                        grunt.file.copy(filePath, path.normalize(relativePath + '/' + distFileName), encoding);
                        return word.replace(fileName, distFileName);
                    }
                });
            });
        }
    });
};
