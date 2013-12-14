module.exports = (grunt) ->
  
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    jshint:
      options:
        node: true
      bin: ['bin/*.js']
      lib: ['lib/*.js']
    
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.registerTask 'test', ['jshint']