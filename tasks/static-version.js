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
            crypto = require('crypto'),
            loger = [],
            files,
            currentFile,
            task,
            changed,
            encoding = {
                encoding: 'utf8'
            };

        grunt.log.writeln(grunt.util.linefeed + 'Start task grunt-static-version...');

        for (task in config) {
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
                    if (linkPath.search(/^.*?:\/\//i) === 0) return word;

                    var file = path.normalize((files.baseDir || '') + path.sep + linkPath),
                        tsInFile,
                        lastChange,
                        md5InFile,
                        md5Now,
                        relativePath,
                        fileName,
                        fileNameSplit,
                        dest,
                        key,
                        reg;

                    // ignore from setting, use for template path such as '{{template variable}}/path/to/file' .
                    if (files.ignore) {
                        for (key in files.ignore) {
                            if (files.ignore.hasOwnProperty(key)) {
                                reg = new RegExp(key + '.*?' + files.ignore[key], 'ig');
                                file = file.replace(reg, '');
                            }
                        }
                    }

                    // output in timestamp or md5
                    if (!files.output || files.output !== 'md5') {
                        // if there is a timestamp, remove it
                        if (file.indexOf('?') !== -1) {
                            tsInFile = file.slice(-13);
                            file = file.slice(0, -14);
                        }
                        // if can't find that file, log warn and return
                        if (!grunt.file.exists(file)) {
                            grunt.log.warn('File not found: ' + file + ' in ' + currentFile);
                            return word;
                        }
                        // decide to change it or not
                        lastChange = fs.statSync(file).mtime.getTime();
                        if (tsInFile) {
                            if (tsInFile === lastChange.toString()) {
                                return word;
                            } else {
                                changed = true;
                                return word.slice(0, -15) + '?' + lastChange + '"';
                            }
                        } else {
                            changed = true;
                            return word.slice(0, -1) + '?' + lastChange + '"';
                        }
                    } else {
                        // if can't find that file, log warn and return
                        if (!grunt.file.exists(file)) {
                            grunt.log.warn('File not found: ' + file + ' in ' + currentFile);
                            return word;
                        }
                        // decide to change it or not
                        reg = file.lastIndexOf('/') + 1;
                        relativePath = file.slice(0, reg);
                        fileName = file.slice(reg);
                        fileNameSplit = fileName.split('.');
                        if (fileNameSplit.length < 3) {
                            changed = true;
                            md5Now = getMd5(file).slice(0, 16);
                            dest = relativePath + fileNameSplit[0] + '.' + md5Now + '.' + fileNameSplit[1];
                            grunt.file.copy(file, dest, encoding);
                            return word.replace(fileName, fileNameSplit[0] + '.' + md5Now + '.' + fileNameSplit[1]);
                        } else {
                            md5InFile = fileNameSplit[fileNameSplit.length - 2];
                            md5Now = getMd5(file.replace(md5InFile + '.', '')).slice(0, 16);
                            if (md5Now === md5InFile) {
                                return word;
                            } else {
                                changed = true;
                                fileNameSplit[fileNameSplit.length - 2] = md5Now;
                                dest = relativePath + fileNameSplit.join('.');
                                grunt.file.copy(file, dest, encoding);
                                return word.replace(fileName, fileNameSplit.join('.'));
                            }
                        }
                    }
                });
            });
        }

        function getMd5(filepath) {
            return crypto.createHash('md5').update(fs.readFileSync(filepath)).digest('hex');
        }
    });
};
