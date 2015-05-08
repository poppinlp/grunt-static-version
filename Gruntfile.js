module.exports = function(grunt) {
    grunt.config.init({
        "static-version": {
            dist: {
                options: {
                    baseDir: 'test/',
                    output: 'timestamp'
                },
                src: ['test/index.html', 'test/test2.html']
            }
        }
    });

    grunt.loadTasks('tasks/');
    grunt.registerTask('test', ['static-version']);
};
