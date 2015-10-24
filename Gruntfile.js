module.exports = function(grunt) {
    grunt.config.init({
        "static-version": {
            dist: {
                options: {
                    baseDir: 'test/',
                    output: 'timestamp',
                    warn: true
                },
                src: 'test/html/*.html',
                dest: 'test/output/'
            }
        }
    });

    grunt.loadTasks('tasks/');
    grunt.registerTask('test', ['static-version']);
};
