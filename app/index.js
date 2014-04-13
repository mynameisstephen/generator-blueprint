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
				process.chdir(process.cwd() + '/source');

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
			'type': 'confirm',
			'name': 'optionIE8',
			'message': 'Are you supporting IE8?',
			'default': true
		}, {
			'type': 'confirm',
			'name': 'optionResponsive',
			'message': 'Is it responsive?',
			'default': true
		}];

		this.prompt(prompts, function (props) {
			this.projectName = props.projectName;
			this.projectDescription = props.projectDescription;
			this.projectAuthor = props.projectAuthor;
			this.optionIE8 = props.optionIE8;
			this.optionResponsive = props.optionResponsive;

			done();
		}.bind(this));
	},

  	app: function () {
	  	var depsBower = [];
	  	var depsGrunt = [];

		this.mkdir('deploy');

		this.mkdir('source');
		this.mkdir('source/fonts');
		this.mkdir('source/images');
		this.mkdir('source/images/.spritesheets');
		this.mkdir('source/js');
		this.mkdir('source/sass');

		this.copy('.bowerrc', 'source/.bowerrc');
		
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
		this.template('_bower.json', 'source/bower.json');

		this.copy('config.rb', 'source/config.rb');

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
		this.template('_gruntfile.js', 'source/gruntfile.js');

		this.template('_package.json', 'source/package.json');

		this.copy('sass/_base.spritesheets.scss', 'source/sass/_base.spritesheets.scss');
		this.copy('sass/_settings.compass.scss', 'source/sass/_settings.compass.scss');
		if (this.optionResponsive) {
			if (this.optionIE8) {
				this.copy('sass/_base.ie8grid.scss', 'source/sass/_base.ie8grid.scss');
				this.copy('sass/_settings.foundation-ie8.scss', 'source/sass/_settings.foundation.scss');
			} else {
				this.copy('sass/_settings.foundation.scss', 'source/sass/_settings.foundation.scss');				
			}
		}
		this.template('sass/_main.scss', 'source/sass/main.scss');

		this.copy('index.html', 'deploy/index.html');
	},

  	projectfiles: function () {
  	}
});

module.exports = BlueprintGenerator;