module.exports = function(grunt) {
    grunt.config.init({
        "static-version": {
            options: {
                baseDir: 'test/assets/',
                warn: true
            },
            ts: {
                options: {
                    output: 'timestamp',
                },
                src: 'test/templates/ts.html',
                dest: 'test/output/'
            },
            md5: {
                src: 'test/templates/md5.html',
                dest: 'test/output/'
            },
            empty: {
                options: {
                    output: 'timestamp',
                },
                src: 'test/templates/empty.html',
                dest: 'test/output/'
            },
        }
    });

    grunt.loadTasks('tasks/');
    grunt.registerTask('test', ['static-version']);
};
