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
	  	var depsBower = [];
	  	var depsGrunt = [];

		this.mkdir(this.projectDeployRoot);

		this.mkdir(this.projectSourceRoot);
		this.mkdir(this.projectSourceRoot + '/fonts');
		this.mkdir(this.projectSourceRoot + '/images');
		this.mkdir(this.projectSourceRoot + '/images/.spritesheets');
		this.mkdir(this.projectSourceRoot + '/js');
		this.mkdir(this.projectSourceRoot + '/sass');

		this.copy('.bowerrc', this.projectSourceRoot + '/.bowerrc');

		depsBower.push('"normalize-css": "~3.0.1"');
		depsBower.push('"modernizr": "~2.7.2"');
		if (this.optionIE8) {
			depsBower.push('"jquery": "~1.11.0"');
			depsBower.push('"modernizr": "~2.7.2"');

			if (this.optionResponsive) {
				depsBower.push('"respondJS": "~1.4.2"');
				depsBower.push('"foundation": "~4.3.2"');
			}
			depsBower.push('"selectivizr": "https://github.com/keithclark/selectivizr.git#ed2f5e3e56f059ad256cc921e24ecc0e1855f18a"');
		} else {
			depsBower.push('"jquery": "~2.1.0"');

			if (this.optionResponsive) {
				depsBower.push('"foundation": "~5.2.2"');
			}
		}
		this.depsBower = depsBower.join(',\n\t\t');
		this.template('_bower.json', this.projectSourceRoot + '/bower.json');

		this.copy('config.rb', this.projectSourceRoot + '/config.rb');

		this.bannerCSS = '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\\n';
		this.bannerJS = '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\\n\\n';
		if (this.optionIE8) {
			depsGrunt.push('\'vendor/html5shiv/dist/html5shiv.js\'');
			depsGrunt.push('\'vendor/jquery/dist/jquery.js\'');
			depsGrunt.push('\'vendor/modernizr/modernizr.js\'');

			if (this.optionResponsive) {
				depsGrunt.push('\'vendor/selectivizr/selectivizr.js\'');
				depsGrunt.push('\'vendor/respondJS/respond.src.js\'');
			}
		} else {
			depsGrunt.push('\'vendor/jquery/dist/jquery.js\'');
			depsGrunt.push('\'vendor/modernizr/modernizr.js\'');
		}
		this.depsGrunt = depsGrunt.join(',\n\t\t\t\t\t');
		this.template('_gruntfile.js', this.projectSourceRoot + '/gruntfile.js');

		this.template('_package.json', this.projectSourceRoot + '/package.json');

		this.copy('sass/_base.spritesheets.scss', this.projectSourceRoot + '/sass/_base.spritesheets.scss');
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
			this.copy('index.html', this.projectDeployRoot + '/index.html');
		}
	},

  	projectfiles: function () {
  	}
});

module.exports = BlueprintGenerator;