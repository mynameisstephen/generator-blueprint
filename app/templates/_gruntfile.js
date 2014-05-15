module.exports = function(grunt) {

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),

		'clean': {
			'options': {
				'force': true
			},

			'stage-css': 'bin/css',
			'stage-js': 'bin/js',

			'prod-css': '<%= pathSourceToDeploy %>/css',
			'prod-fonts': '<%= pathSourceToDeploy %>/fonts',
			'prod-images': '<%= pathSourceToDeploy %>/images',
			'prod-js': '<%= pathSourceToDeploy %>/js'
		},

		'compass': {
			'build': {
			}
		},

		'requirejs': {
			'compile': {
				'options': {
					'name': 'main',
					'baseUrl': 'js/',
					'logLevel': 1,
					'paths': {
						<%= depsVendorPaths %>
					},
					'deps': [
						<%= depsVendorLibs %>
					],
					'shim': {
						<%= depsVendorShims %>
					},
					'optimize': 'none',
					'out': 'bin/js/main.js'
				}
			}
		},

		'rename': {
			'css': {
				'expand': true,
				'cwd': 'bin/css/',
				'src': ['*.css', '!*.min.css'],
				'dest': 'bin/css/',
				'ext': '.min.css'
			},
			'js': {
				'expand': true,
				'cwd': 'bin/js/',
				'src': ['*.js', '!*.min.js'],
				'dest': 'bin/js/',
				'ext': '.min.js'
			}
		},

		'cssmin': {
			'stage': {
				'options': {
					'banner': '<%= bannerCSS %>',
					'keepSpecialComments': 0
				},
				'expand': true,
				'cwd': 'bin/css/',
				'src': ['*.css', '!*.min.css'],
				'dest': 'bin/css/',
				'ext': '.min.css'
			}
		},

		'uglify': {
			'main': {
				'options': {
					'banner': '<%= bannerJS %>'
				},
				'src': 'bin/js/main.js',
				'dest': 'bin/js/main.min.js'
			},
			'vendor': {
				'files': [{
					'expand': true,
					'cwd': 'bin/js/',
					'src': ['*.js', '!*.min.js', '!main*.js'],
					'dest': 'bin/js/',
					'ext': '.min.js'
				}]
			}
		},

		'copy': {
			'normalize-css': {
				'src': 'vendor/normalize-css/normalize.css',
				'dest': 'sass/_base.normalize.scss'
			},
			<%
				if (optionIE8) {
					print('\n\t\t\t\'html5shiv\': {\n');
					print('\t\t\t\t\'src\': \'vendor/html5shiv/dist/html5shiv.js\',\n');
					print('\t\t\t\t\'dest\': \'bin/js/html5shiv.js\'\n');
					print('\t\t\t},');
				}
			%>

			'requirejs': {
				'src': 'vendor/requirejs/require.js',
				'dest': 'bin/js/require.js'
			},

			'deploy-css': {
				'expand': true,
				'cwd': 'bin/css',
				'src': '*.min.css',
				'dest': '<%= pathSourceToDeploy %>/css'
			},
			'deploy-fonts': {
				'expand': true,
				'cwd': 'fonts',
				'src': '*',
				'dest': '<%= pathSourceToDeploy %>/fonts'
			},
			'deploy-images': {
				'files': [
					{ 'expand': true, 'cwd': 'images', 'src': '**', 'dest': '<%= pathSourceToDeploy %>/images' },
					{ 'expand': true, 'cwd': 'bin/images', 'src': '**', 'dest': '<%= pathSourceToDeploy %>/images' }
				]
			},
			'deploy-js': {
				'expand': true,
				'cwd': 'bin/js',
				'src': '*.min.js',
				'dest': '<%= pathSourceToDeploy %>/js'
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
			'rename:css',
			'clean:prod-css',
			'clean:prod-fonts',
			'clean:prod-images',
			'copy:deploy-css',
			'copy:deploy-fonts',
			'copy:deploy-images'
		]
	);

	grunt.registerTask(
		'build-dev-js',
		[
			'clean:stage-js',
			'requirejs:compile', <%
				if (optionIE8) {
					print('\n\t\t\t\'copy:html5shiv\',');
				} %>
			'copy:requirejs',
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
			'cssmin:stage',
			'clean:prod-css',
			'clean:prod-fonts',
			'clean:prod-images',
			'copy:deploy-css',
			'copy:deploy-fonts',
			'copy:deploy-images'
		]
	);

	grunt.registerTask(
		'build-prod-js',
		[
			'clean:stage-js',
			'requirejs:compile', <%
				if (optionIE8) {
					print('\n\t\t\t\'copy:html5shiv\',');
				} %>
			'copy:requirejs',
			'uglify:main',
			'uglify:vendor',
			'clean:prod-js',
			'copy:deploy-js'
		]
	);

	grunt.registerTask('build-prod', ['build-prod-css', 'build-prod-js']);

	grunt.registerTask('default', ['build-prod-css', 'build-prod-js']);
};