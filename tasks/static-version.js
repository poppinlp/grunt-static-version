/*
 * grunt-static-version
 * https://github.com/poppinlp/grunt-static-version
 *
 * Copyright (c) 2014 "PoppinLp" Liang Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask('static-version', 'Update static resource version', function () {
        this.requiresConfig([this.name, this.target, "src"].join("."));

        var options = this.options({
                symbol: '<!--##>',
                baseDir: './',
                warn: false,
                output: 'md5'
            }),
            path = require('path'),
            fs = require('fs'),
            crypto = require('crypto'),
            fc = require('file-changed');

        this.files.forEach(function (task) {
            task.src.forEach(function (file) {
                grunt.file.write(file, checkFile(grunt.file.read(file)));
            });
        });
        fc.save();

        function checkFile(content) {
            var reg = new RegExp(options.symbol + '.*?' + options.symbol, 'gi');

            return content.replace(reg, function (word) {
                var fileName = word.slice(options.symbol.length, -options.symbol.length);

                if (options.output === 'md5') {
                    return md5(fileName);
                } else {
                    return ts(fileName);
                }
            });
        }

        function ts(file) {
            var index = file.indexOf('?'),
                filePath,
                tsInFile,
                lastChange;

            // if there is a timestamp, remove it
            if (index !== -1) {
                filePath = path.join(options.baseDir, file.slice(0, index));
                tsInFile = file.slice(index + 1);
            } else {
                filePath = path.join(options.baseDir, file);
            }

            // if can't find that file, log warn and return
            if (!grunt.file.exists(filePath)) {
                options.warn && grunt.log.warn('File not found: ' + filePath);
                return file;
            }

            // decide to change it or not
            if (!tsInFile) {
                fc.addFile(filePath).update(filePath);
                return file + '?' + fc.get(filePath);
            } else {
                fc.update(filePath);
                lastChange = fc.get(filePath);
                if (tsInFile === lastChange) return file;
                return file.slice(0, -14) + '?' + lastChange;
            }
        }

        function md5(file) {
            var filePath = path.join(options.baseDir, file),
                index = filePath.lastIndexOf(path.sep) + 1,
                relativePath = filePath.slice(0, index),
                fileName = filePath.slice(index),
                fileNameSplit = fileName.split('.'),
                md5InFile = fileNameSplit.length === 3 ? fileNameSplit[1] : '',
                originFileName = md5InFile ? fileNameSplit[0] + '.' + fileNameSplit[2] : fileName,
                originFilePath = path.normalize(relativePath + '/' + originFileName);

            // if can't find that file, log warn and return
            if (!grunt.file.exists(originFilePath)) {
                options.warn && grunt.log.warn('File not found: ' + originFileName);
                return file;
            }

            // decide to change it or not
            var md5Now = fc.get(originFilePath, 'md5'),
                distFileName;

            if (md5Now === md5InFile) return file;

            fc.addFile(originFilePath).update(originFilePath);
            distFileName = fileNameSplit[0] + '.' + fc.get(originFilePath, 'md5') + '.' + fileNameSplit[fileNameSplit.length - 1];
            grunt.file.copy(filePath, path.normalize(relativePath + '/' + distFileName));

            return file.replace(fileName, distFileName);
        }
    });
};
