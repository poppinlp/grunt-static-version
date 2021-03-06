'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask('static-version', 'Update static resource version', function () {
        var that = this;

        that.requiresConfig([that.name, that.target, "src"].join("."));

        var path = require('path'),
            fc = require('file-changed'),
            async = require('async'),
            done = this.async(),
            options = that.options({
                symbol: '<!--##-->',
                baseDir: './',
                warn: false,
                output: 'md5',
                cdn: false,
                cdnDomain: ''
            }),
            cache = {};

        async.waterfall(that.files.map(function (task) {
            return function (cb) {
                async.parallel(task.src.map(function (filePath) {
                    return function (cb) {
                        var reg = new RegExp(options.symbol + '.*?' + options.symbol, 'gi'),
                            content = grunt.file.read(filePath),
                            matchArr = content.match(reg) || [];

                        async.parallel(matchArr.map(function (word) {
                            return function (cb) {
                                var targetFile = word.slice(options.symbol.length, -options.symbol.length);

                                if (options.cdn) {
                                    options.cdn(path.join(options.baseDir, targetFile), function (err, ret) {
                                        if (err) {
                                            cb(err);
                                            return;
                                        }
                                        content = content.replace(new RegExp(word, 'g'), options.cdnDomain + ret.key + '?' + ret.hash);
                                        cb(null, ret);
                                    });
                                } else if (options.output === 'md5') {
                                    md5(targetFile, filePath, function (err, ret) {
                                        if (err) {
                                            cb(err);
                                            return;
                                        }
                                        content = content.replace(new RegExp(word, 'g'), ret);
                                        cb(null, ret);
                                    });
                                } else {
                                    ts(targetFile, filePath, function (err, ret) {
                                        if (err) {
                                            cb(err);
                                            return;
                                        }
                                        content = content.replace(new RegExp(word, 'g'), ret);
                                        cb(null, ret);
                                    });
                                }
                            };
                        }), function (err, res) {
                            if (err) {
                                console.error(err);
                            } else {
                                var writePath = task.dest ? path.join(task.dest, path.basename(filePath)) : filePath;
                                grunt.file.write(writePath, content);
                                grunt.log.ok('Update version successfully => ' + filePath);
                            }

                            cb(err, res);
                        });
                    };
                }), cb);
            };
        }), function (err, res) {
            if (err) {
                console.error(err);
            } else {
                grunt.log.ok('Static version all tasks done successfully!');
                fc.save();
                done();
            }
        });

        function ts(originTarget, filePath, cb) {
            var index = originTarget.indexOf('?'),
                targetPath,
                tsInFile,
                lastChange;

            // if there is a timestamp, remove it
            if (index !== -1) {
                targetPath = path.join(options.baseDir, originTarget.slice(0, index));
                tsInFile = originTarget.slice(index + 1);
            } else {
                targetPath = path.join(options.baseDir, originTarget);
            }

            // if can't find that file, log warn and return
            if (!grunt.file.exists(targetPath)) {
                options.warn && grunt.log.warn('File not found: ' + targetPath + ' in ' + filePath);
                cb(null, originTarget);
                return;
            }

            // decide to change it or not
            if (!tsInFile) {
                fc.addFile(targetPath).update(targetPath);
                cb(null, originTarget + '?' + fc.get(targetPath));
            } else {
                fc.update(targetPath);
                lastChange = fc.get(targetPath);
                if (tsInFile === lastChange) return originTarget;
                cb(null, originTarget.slice(0, -14) + '?' + lastChange);
            }
        }

        function md5(originTarget, filePath, cb) {
            var targetPath = path.join(options.baseDir, originTarget),
                dirPath = path.dirname(targetPath),
                fileName = path.basename(targetPath),
                fileNameSplit = fileName.split('.'),
                splitLength = fileNameSplit.length,
                md5InFile = splitLength >= 3 && fileNameSplit[1].length === 16 ? fileNameSplit[1] : '',
                originFileName = md5InFile ? fileNameSplit[0] + '.' + fileNameSplit.slice(2).join('.') : fileName,
                originFilePath = path.join(dirPath, originFileName);

            // if can't find that file, log warn and return
            if (!grunt.file.exists(originFilePath)) {
                options.warn && grunt.log.warn('File not found: ' + originFileName + ' in ' + filePath);
                cb(null, originTarget);
                return;
            }

            // decide to change it or not
            var md5Now = fc.get(originFilePath, 'md5');

            if (md5Now === md5InFile) {
                cb(null, originTarget);
                return;
            }

            fc.addFile(originFilePath).update(originFilePath);

            var idx = originFileName.indexOf('.'),
                distFileName = originFileName.slice(0, idx + 1) + fc.get(originFilePath, 'md5') + originFileName.slice(idx);

            grunt.file.copy(targetPath, path.join(dirPath, distFileName));

            cb(null, originTarget.replace(fileName, distFileName));
        }
    });
};
