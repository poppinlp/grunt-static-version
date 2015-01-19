module.exports = function(grunt) {
    grunt.config.init({
        "jshint": {
            options: grunt.file.readJSON(__dirname + '/.jshintrc'),
            www: {
                src: ['tasks/static-version.js']
            }
        },
        "static-version": {
            dist: {
                files: {
                    src: 'test/*.html',
                    baseDir: 'test/',
                    ignore: {
                        '{{': '}}'
                    },
                    output: 'md5'
                }
            }
        }
    });

    grunt.loadTasks('tasks/');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint', 'static-version']);
};
