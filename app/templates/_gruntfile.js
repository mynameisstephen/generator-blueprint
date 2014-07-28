module.exports = function(grunt) {

	grunt.initConfig({
		'PACKAGE': grunt.file.readJSON('package.json'),

		'PATH_BIN': 'bin',
		'PATH_DEPLOY': '<%= paths.sourceToDeploy %>',

		'clean': {
			'options': {
				'force': true
			},

			'stage-css': '<%%= PATH_BIN %>/css',
			'stage-js': '<%%= PATH_BIN %>/js',

			'prod-css': '<%%= PATH_DEPLOY %>/css',
			'prod-fonts': '<%%= PATH_DEPLOY %>/fonts',
			'prod-images': '<%%= PATH_DEPLOY %>/images',
			'prod-js': '<%%= PATH_DEPLOY %>/js'
		},

		'compass': {
			'build': {
			}
		},

		'requirejs': {
			'compile': {
				'options': {
					'name': 'main',
					'mainConfigFile': 'js/config.main.js',
					'baseUrl': 'js/',
					'logLevel': 1,
					'optimize': 'none',
					'out': '<%%= PATH_BIN %>/js/main.js'
				}
			}
		},

		'rename': {
			'css': {
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/css/',
				'src': ['*.css', '!*.min.css'],
				'dest': '<%%= PATH_BIN %>/css/',
				'ext': '.min.css'
			},
			'js': {
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/js/',
				'src': ['*.js', '!*.min.js'],
				'dest': '<%%= PATH_BIN %>/js/',
				'ext': '.min.js'
			}
		},

		'cssmin': {
			'stage': {
				'options': {
					'banner': '/*! <%%= PACKAGE.name %> <%%= grunt.template.today("dd-mm-yyyy") %> */',
					'keepSpecialComments': 0,
					'noAdvanced': true
				},
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/css/',
				'src': ['*.css', '!*.min.css'],
				'dest': '<%%= PATH_BIN %>/css/',
				'ext': '.min.css'
			}
		},

		'uglify': {
			'stage': {
				'options': {
					'banner': '/*! <%%= PACKAGE.name %> <%%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/js/',
				'src': ['*.js', '!*.min.js'],
				'dest': '<%%= PATH_BIN %>/js/',
				'ext': '.min.js'
			}
		},

		'copy': {
			'static-css': {
				'expand': true,
				'cwd': 'static/css/',
				'src': '**',
				'dest': '<%%= PATH_BIN %>/css'
			},
			'static-js': {
				'expand': true,
				'cwd': 'static/js/',
				'src': '**',
				'dest': '<%%= PATH_BIN %>/js'
			},

			'vendor-css': {
				'files': [
				]
			},
			'vendor-js': {
				'files': [
					{ 'src': 'vendor/modernizr/modernizr.js', 'dest': '<%%= PATH_BIN %>/js/modernizr.js' },
					{ 'src': 'vendor/requirejs/require.js', 'dest': '<%%= PATH_BIN %>/js/require.js' }
				]
			},

			'deploy-css': {
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/css',
				'src': '*.min.css',
				'dest': '<%%= PATH_DEPLOY %>/css'
			},
			'deploy-js': {
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/js',
				'src': '*.min.js',
				'dest': '<%%= PATH_DEPLOY %>/js'
			},
			'deploy-static': {
				'expand': true,
				'cwd': 'static',
				'src': ['**', '!css/**', '!js/**'],
				'dest': '<%%= PATH_DEPLOY %>'
			},
			'deploy-sprites': {
				'expand': true,
				'cwd': '<%%= PATH_BIN %>/images',
				'src': '**',
				'dest': '<%%= PATH_DEPLOY %>/images'
			}
		},

		'watch': {
			'css': {
				'files': 'sass/**',
				'tasks': ['build-dev-css']
			},
			'js': {
				'files': 'js/**',
				'tasks': ['build-dev-js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-rename');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask(
		'build-dev-css',
		[
			'clean:stage-css',
			'compass:build',
			'copy:static-css',
			'copy:vendor-css',
			'rename:css',
			'clean:prod-css',
			'clean:prod-fonts',
			'clean:prod-images',
			'copy:deploy-css',
			'copy:deploy-static',
			'copy:deploy-sprites'
		]
	);

	grunt.registerTask(
		'build-dev-js',
		[
			'clean:stage-js',
			'requirejs:compile',
			'copy:static-js',
			'copy:vendor-js',
			'rename:js',
			'clean:prod-js',
			'copy:deploy-js'
		]
	);

	grunt.registerTask('build-dev', ['build-dev-css', 'build-dev-js']);

	grunt.registerTask(
		'build-prod-css',
		[
			'clean:stage-css',
			'compass:build',
			'copy:static-css',
			'copy:vendor-css',
			'cssmin:stage',
			'clean:prod-css',
			'clean:prod-fonts',
			'clean:prod-images',
			'copy:deploy-css',
			'copy:deploy-static',
			'copy:deploy-sprites'
		]
	);

	grunt.registerTask(
		'build-prod-js',
		[
			'clean:stage-js',
			'requirejs:compile',
			'copy:static-js',
			'copy:vendor-js',
			'uglify:stage',
			'clean:prod-js',
			'copy:deploy-js'
		]
	);

	grunt.registerTask('build-prod', ['build-prod-css', 'build-prod-js']);

	grunt.registerTask('default', ['build-prod-css', 'build-prod-js']);
};