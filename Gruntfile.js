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

    autoprefixer: {
      options: {
        browsers: ['> 0.5%']
      },
      main: {
        src: 'css/src/main.css',
        dest: 'css/dist/main.css'
      },
    },

    watch: {
      options: {
        atBegin: true
      },

      autoprefixer: {
        files: ['css/src/main.css'],
        tasks: ['autoprefixer:main']
      },
    }
  });

  grunt.registerTask('default', ['connect', 'watch']);

};