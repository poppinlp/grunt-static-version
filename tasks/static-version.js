'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask('static-version', 'Update static resource version', function () {
        var that = this;

        that.requiresConfig([that.name, that.target, "src"].join("."));
        that.requiresConfig([that.name, that.target, "dest"].join("."));

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
                            content = grunt.file.read(filePath);

                        async.parallel(content.match(reg).map(function (word) {
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
                                grunt.file.write(path.join(task.dest, path.basename(filePath)), content);
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

        function checkFile(filePath, content) {
            var reg = new RegExp(options.symbol + '.*?' + options.symbol, 'gi');

            async.parallel(content.match(reg).map(function (value) {
                return new Promise(function (resolve, reject) {
                    var targetFile = value.slice(options.symbol.length, -options.symbol.length);
                    cdn(targetFile).then(function (res) {
                        resolve(res);
                    });
                });
            }), function (err, ret) {
                console.log(err, ret);
            });
        }

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
                md5InFile = splitLength >= 3 ? fileNameSplit[splitLength - 2] : '',
                originFileName = md5InFile ? fileNameSplit.slice(0, -2).join('.') + '.' + fileNameSplit[splitLength - 1] : fileName,
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

            var ext = path.extname(originFileName),
                distFileName = originFileName.replace(ext, '') + '.' + fc.get(originFilePath, 'md5') + ext;

            grunt.file.copy(targetPath, path.join(dirPath, distFileName));

            cb(null, targetPath.replace(fileName, distFileName));
        }
    });
};
