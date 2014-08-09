module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 3020,
        }
      }
    },

    watch: {

    }
  });

  grunt.registerTask('default', ['connect', 'watch']);

};