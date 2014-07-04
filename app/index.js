'use strict';
var file = require('yeoman-generator').file;
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var BlueprintGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.on('end', function () {
			if (!this.options['skip-install']) {
				process.chdir(process.cwd() + '/' + this.paths.source);

				this.installDependencies({
					'callback': function() {
						file.copy(
							'vendor/normalize-css/normalize.css',
							'sass/_base.normalize.scss'
						);
					}.bind(this)
				});
			}
		});
	},

	askFor: function () {
		var done = this.async();

		this.log(this.yeoman);
		this.log(chalk.bold.cyan('Blueprint generator\n'));

		var prompts = [{
			'name': 'projectName',
			'message': 'What is the project called?',
			'default': 'Project'
		}, {
			'name': 'projectDescription',
			'message': 'Enter a project description?',
			'default': ''
		}, {
			'name': 'projectAuthor',
			'message': 'Who is the project author?',
			'default': 'Stephen Nolan'
		}, {
			'name': 'optionIE8',
			'type': 'confirm',
			'message': 'Are you supporting IE8?',
			'default': true
		}, {
			'name': 'optionCSSFramework',
			'type': 'list',
			'message': 'Which CSS Framework do you want to use?',
			'choices': [
				{ 'name': 'None', 'value': 'none' },
				{ 'name': 'Jeet/Breakpoint-Sass', 'value': 'jeet-bps' },
				{ 'name': 'Zurb Foundation', 'value': 'zurb' }
			]
		}, {
			'name': 'projectSourceRoot',
			'message': 'What is the path to the project source root?',
			'default': 'source'
		}, {
			'name': 'projectDeployRoot',
			'message': 'What is the path to the project deploy root?',
			'default': 'deploy'
		}, {
			'name': 'optionCreateIndex',
			'type': 'confirm',
			'message': 'Create index.html?',
			'default': true
		}];

		this.prompt(prompts, function (props) {
			var sourceDirectories = null;
			var deployDirectories = null;

			this.project = {
				'name': props.projectName,
				'description': props.projectDescription,
				'author': props.projectAuthor
			};

			this.options = {
				'IE8': props.optionIE8,
				'CSSFramework': props.optionCSSFramework,
				'index': props.optionCreateIndex
			};

			this.paths = {
				'source': props.projectSourceRoot,
				'deploy': props.projectDeployRoot
			};

			sourceDirectories = this.paths.source.split(/[\\/]+/);
			deployDirectories = this.paths.deploy.split(/[\\/]+/);

			for (var s = sourceDirectories.length - 1; s >= 0; s--) {
				if (sourceDirectories[s] == '') {
					sourceDirectories.splice(s, 1);
				}
			}

			for (var d = deployDirectories.length - 1; d >= 0; d--) {
				if (deployDirectories[d] == '') {
					deployDirectories.splice(d, 1);
				}
			}

			while (sourceDirectories[0] == deployDirectories[0]) {
				sourceDirectories.shift();
				deployDirectories.shift();
			}

			this.paths.sourceToDeploy = '';
			for (var d = 0; d < sourceDirectories.length; d++) {
				this.paths.sourceToDeploy = this.paths.sourceToDeploy + '../';
			}
			this.paths.sourceToDeploy = this.paths.sourceToDeploy + deployDirectories.join('/');

			done();
		}.bind(this));
	},

  	app: function () {
  		this.dependencies = {
  			'bower': [],
  			'compass': [],
  			'require': {
  				'paths': [],
  				'deps': [],
  				'shim': []
  			},
  			'sass': []
  		};

		this.dependencies.bower.push(
			'"normalize-css": "~3.0.1"',
			'"modernizr": "~2.7.2"',
			'"requirejs": "~2.1.11"'
		);

		this.dependencies.require.paths.push('\'vendor/JQuery\': \'../vendor/jquery/dist/jquery\'');
		this.dependencies.require.deps.push('\'vendor/JQuery\'');
		this.dependencies.require.shim.push('\'vendor/JQuery\': {\n\t\t\t\'exports\': \'$\'\n\t\t}');

		if (this.options.IE8) {
			this.dependencies.bower.push(
				'"jquery": "~1.11.0"',
				'"selectivizr": "https://github.com/keithclark/selectivizr.git#ed2f5e3e56f059ad256cc921e24ecc0e1855f18a"'
			);

			this.dependencies.require.paths.push('\'vendor/Selectivizr\': \'../vendor/selectivizr/selectivizr\'');
			this.dependencies.require.deps.push('\'vendor/Selectivizr\'');
		} else {
			this.dependencies.bower.push('"jquery": "~2.1.0"');
		}

		switch (this.options.CSSFramework) {
			case 'jeet-bps':
				if (this.options.IE8) {
					this.dependencies.bower.push('"respondJS": "~1.4.2"');

					this.dependencies.require.paths.push('\'vendor/Respond\': \'../vendor/respondJS/dest/respond.src\'');
					this.dependencies.require.deps.push('\'vendor/Respond\'');
					this.dependencies.require.shim.push('\'vendor/Respond\': {\n\t\t\t\'exports\': \'respond\'\n\t\t}');
				}

				this.dependencies.bower.push(
					'"jeet.gs": "~5.1.3"',
					'"breakpoint-sass": "~2.4.2"'
				);

				this.dependencies.compass.push('add_import_path "vendor/jeet.gs/scss/jeet"');
				this.dependencies.compass.push('add_import_path "vendor/breakpoint-sass/stylesheets"');

				this.dependencies.sass.push(
					'@import "settings.jeet";',
					'@import "settings.breakpoint";'
				);

				break;
			case 'zurb':
				if (this.options.IE8) {
					this.dependencies.bower.push(
						'"respondJS": "~1.4.2"',
						'"foundation": "~4.3.2"'
					);

					this.dependencies.require.paths.push('\'vendor/Respond\': \'../vendor/respondJS/dest/respond.src\'');
					this.dependencies.require.deps.push('\'vendor/Respond\'');
					this.dependencies.require.shim.push('\'vendor/Respond\': {\n\t\t\t\'exports\': \'respond\'\n\t\t}');
				} else {
					this.dependencies.bower.push('"foundation": "~5.2.2"')
				}

				this.dependencies.compass.push('add_import_path "vendor/foundation/scss"');

				this.dependencies.sass.push('@import "settings.foundation";');

				break;
			default:
				// No framework
				break;
		}

		this.mkdir(this.paths.deploy);

		this.mkdir(this.paths.source);
		this.mkdir(this.paths.source + '/js');
		this.mkdir(this.paths.source + '/sass');
		this.mkdir(this.paths.source + '/sprites');
		this.mkdir(this.paths.source + '/static');
		this.mkdir(this.paths.source + '/static/css');
		this.mkdir(this.paths.source + '/static/fonts');
		this.mkdir(this.paths.source + '/static/images');
		this.mkdir(this.paths.source + '/static/js');

		this.copy('.bowerrc', this.paths.source + '/.bowerrc');
		this.template('_bower.json', this.paths.source + '/bower.json');
		this.template('_config.rb', this.paths.source + '/config.rb');
		this.template('_gruntfile.js', this.paths.source + '/gruntfile.js');
		this.template('_package.json', this.paths.source + '/package.json');

		this.template('js/_config.main.js', this.paths.source + '/js/config.main.js');
		this.copy('js/main.js', this.paths.source + '/js/main.js');

		this.copy('sass/_base.spritesheets.scss', this.paths.source + '/sass/_base.spritesheets.scss');
		this.copy('sass/_base.typography.scss', this.paths.source + '/sass/_base.typography.scss');
		this.copy('sass/_settings.compass.scss', this.paths.source + '/sass/_settings.compass.scss');

		switch (this.options.CSSFramework) {
			case 'jeet-bps':
				this.copy('sass/_settings.jeet.scss', this.paths.source + '/sass/_settings.jeet.scss');
				this.copy('sass/_settings.breakpoint.scss', this.paths.source + '/sass/_settings.breakpoint.scss');

				break;
			case 'zurb':
				if (this.options.IE8) {
					this.copy('sass/_settings.foundation-ie8.scss', this.paths.source + '/sass/_settings.foundation.scss');
				} else {
					this.copy('sass/_settings.foundation.scss', this.paths.source + '/sass/_settings.foundation.scss');
				}

				break;
			default:
				// No framework
				break;
		}

		this.template('sass/_main.scss', this.paths.source + '/sass/main.scss');

		if (this.options.index) {
			this.copy('index.html', this.paths.deploy + '/index.html');
		}
	},

  	projectfiles: function () {
  	}
});

module.exports = BlueprintGenerator;