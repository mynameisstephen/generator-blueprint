'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var BlueprintGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			if (!this.options['skip-install']) {
				process.chdir(process.cwd() + '/' + this.projectSourceRoot);

				// We need to do npm install before bower since bower runs
				// a post install grunt task.
				this.installDependencies({
					'bower': false,
					'npm': true,
					'callback': function() {
						this.installDependencies({
							'bower': true,
							'npm': false
						});
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
			'name': 'optionResponsive',
			'type': 'confirm',
			'message': 'Is it responsive?',
			'default': true
		}, {
			'name': 'projectSourceRoot',
			'message': 'What is the path to the project source root?',
			'default': 'source'
		}, {
			'name': 'projectDeployRoot',
			'message': 'What is the path to the project deploy root?',
			'default': 'publish'
		}, {
			'name': 'optionCreateIndex',
			'type': 'confirm',
			'message': 'Create index.html?',
			'default': true
		}];

		this.prompt(prompts, function (props) {
			var sourceDirectories = null;
			var deployDirectories = null;

			this.projectName = props.projectName;
			this.projectDescription = props.projectDescription;
			this.projectAuthor = props.projectAuthor;
			this.optionIE8 = props.optionIE8;
			this.optionResponsive = props.optionResponsive;
			this.projectSourceRoot = props.projectSourceRoot;
			this.projectDeployRoot = props.projectDeployRoot;
			this.optionCreateIndex = props.optionCreateIndex;

			sourceDirectories = this.projectSourceRoot.split(/[\\/]+/);
			deployDirectories = this.projectDeployRoot.split(/[\\/]+/);

			if (sourceDirectories.length > 0) {
				if (sourceDirectories[0] == '') {
					sourceDirectories.unshift();
				}
			}

			if (sourceDirectories.length > 0) {
				if (sourceDirectories[sourceDirectories.length - 1] == '') {
					sourceDirectories.pop();
				}
			}

			if (deployDirectories.length > 0) {
				if (deployDirectories[0] == '') {
					deployDirectories.unshift();
				}
			}

			if (deployDirectories.length > 0) {
				if (deployDirectories[deployDirectories.length - 1] == '') {
					deployDirectories.pop();
				}
			}

			while (sourceDirectories[0] == deployDirectories[0]) {
				sourceDirectories.shift();
				deployDirectories.shift();
			}

			this.pathSourceToDeploy = '';
			for (var d = 0; d < sourceDirectories.length; d++) {
				this.pathSourceToDeploy = this.pathSourceToDeploy + '../';
			}
			this.pathSourceToDeploy = this.pathSourceToDeploy + deployDirectories.join('/');

			done();
		}.bind(this));
	},

  	app: function () {
  		var deps = {};

		this.mkdir(this.projectDeployRoot);

		this.mkdir(this.projectSourceRoot);
		this.mkdir(this.projectSourceRoot + '/fonts');
		this.mkdir(this.projectSourceRoot + '/images');
		this.mkdir(this.projectSourceRoot + '/js');
		this.mkdir(this.projectSourceRoot + '/sass');
		this.mkdir(this.projectSourceRoot + '/sprites');

		this.copy('.bowerrc', this.projectSourceRoot + '/.bowerrc');

		deps['bower'] = [];

		deps['bower'].push('"normalize-css": "~3.0.1"');
		deps['bower'].push('"modernizr": "~2.7.2"');
		deps['bower'].push('"requirejs": "~2.1.11"');
		if (this.optionIE8) {
			deps['bower'].push('"html5shiv": "~3.7.2"');
			deps['bower'].push('"jquery": "~1.11.0"');

			if (this.optionResponsive) {
				deps['bower'].push('"respondJS": "~1.4.2"');
				deps['bower'].push('"foundation": "~4.3.2"');
			}
			deps['bower'].push('"selectivizr": "https://github.com/keithclark/selectivizr.git#ed2f5e3e56f059ad256cc921e24ecc0e1855f18a"');
		} else {
			deps['bower'].push('"jquery": "~2.1.0"');

			if (this.optionResponsive) {
				deps['bower'].push('"foundation": "~5.2.2"');
			}
		}
		this.depsBower = deps['bower'].join(',\n\t\t');
		this.template('_bower.json', this.projectSourceRoot + '/bower.json');

		this.copy('config.rb', this.projectSourceRoot + '/config.rb');

		this.bannerCSS = '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\\n';
		this.bannerJS = '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\\n\\n';

		deps['paths'] = [];
		deps['libs'] = [];
		deps['shims'] = [];
		if (this.optionIE8) {
			deps['paths'].push('\'vendor.jquery\': \'../vendor/jquery/dist/jquery\'');
			deps['libs'].push('\'vendor.jquery\'');
			deps['shims'].push('\'vendor.jquery\': {\n\t\t\t\t\t\t\t\'exports\': \'$\'\n\t\t\t\t\t\t}');

			deps['paths'].push('\'vendor.modernizr\': \'../vendor/modernizr/modernizr\'');
			deps['libs'].push('\'vendor.modernizr\'');
			deps['shims'].push('\'vendor.modernizr\': {\n\t\t\t\t\t\t\t\'exports\': \'Modernizr\'\n\t\t\t\t\t\t}');

			if (this.optionResponsive) {
				deps['paths'].push('\'vendor.selectivizr\': \'../vendor/selectivizr/selectivizr\'');
				deps['libs'].push('\'vendor.selectivizr\'');

				deps['paths'].push('\'vendor.respond\': \'../vendor/respondJS/dest/respond.src\'');
				deps['libs'].push('\'vendor.respond\'');
				deps['shims'].push('\'vendor.respond\': {\n\t\t\t\t\t\t\t\'exports\': \'respond\'\n\t\t\t\t\t\t}');
			}
		} else {
			deps['paths'].push('\'vendor.jquery\': \'../vendor/jquery/dist/jquery\'');
			deps['libs'].push('\'vendor.jquery\'');
			deps['shims'].push('\'vendor.jquery\': {\n\t\t\t\t\t\t\t\'exports\': \'$\'\n\t\t\t\t\t\t}');

			deps['paths'].push('\'vendor.modernizr\': \'../vendor/modernizr/modernizr\'');
			deps['libs'].push('\'vendor.modernizr\'');
			deps['shims'].push('\'vendor.modernizr\': {\n\t\t\t\t\t\t\t\'exports\': \'Modernizr\'\n\t\t\t\t\t\t}');
		}
		this.depsVendorPaths = deps['paths'].join(',\n\t\t\t\t\t\t');
		this.depsVendorLibs = deps['libs'].join(',\n\t\t\t\t\t\t');
		this.depsVendorShims = deps['shims'].join(',\n\t\t\t\t\t\t');
		this.template('_gruntfile.js', this.projectSourceRoot + '/gruntfile.js');

		this.template('_package.json', this.projectSourceRoot + '/package.json');

		this.write(this.projectSourceRoot + '/js/main.js', '');
		this.write(this.projectSourceRoot + '/js/config.js', '');

		this.copy('sass/_base.spritesheets.scss', this.projectSourceRoot + '/sass/_base.spritesheets.scss');
		this.copy('sass/_base.typography.scss', this.projectSourceRoot + '/sass/_base.typography.scss');
		this.copy('sass/_settings.compass.scss', this.projectSourceRoot + '/sass/_settings.compass.scss');
		if (this.optionResponsive) {
			if (this.optionIE8) {
				this.copy('sass/_base.ie8grid.scss', this.projectSourceRoot + '/sass/_base.ie8grid.scss');
				this.copy('sass/_settings.foundation-ie8.scss', this.projectSourceRoot + '/sass/_settings.foundation.scss');
			} else {
				this.copy('sass/_settings.foundation.scss', this.projectSourceRoot + '/sass/_settings.foundation.scss');
			}
		}
		this.template('sass/_main.scss', this.projectSourceRoot + '/sass/main.scss');

		if (this.optionCreateIndex) {
			this.template('_index.html', this.projectDeployRoot + '/index.html');
		}
	},

  	projectfiles: function () {
  	}
});

module.exports = BlueprintGenerator;