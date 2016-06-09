module.exports = function (grunt) {

	var test_specs = grunt.file.expand({
		filter: "isFile",
		cwd: "test/unit"
	}, ["**/*.js"]);
	var test_specs_list = test_specs.map(function (name) {
		return "'../test/unit/" + name.substr(0, name.length - 3) + "'";
	}).join(', ');

    var integration_test_specs = grunt.file.expand({
        filter: "isFile",
        cwd: "test/integration"
    }, ["**/*.js"]);
    var integration_specs_list = integration_test_specs.map(function (name) {
        return "'../test/integration/" + name.substr(0, name.length - 3) + "'";
    }).join(', ');

	var acceptance_specs = grunt.file.expand({
		filter: "isFile",
		cwd: "test/acceptance/spec"
	}, ["**/*.js"]);
	var acceptance_specs_list = acceptance_specs.map(function (name) {
		return "'../acceptance/spec/" + name.substr(0, name.length - 3) + "'";
	}).join(', ');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			templates: {
				files: ['**/*.hbs'],
				tasks: ['handlebars:compile'],
				options: {
					spawn: false,
				},
			},
		},
		handlebars: {
			compile: {
				options: {
					amd: true
				},
				files: {
					'samples/compiled.js': ['**/*.fountain']
				}
			},
			test: {
				options: {
					amd: true
				},
				files: {
					'test/data/test_screenplays.js': ['test/**/*.fdx', 'test/**/*.fountain']
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					optimize: "uglify",
					baseUrl: "js",
					mainConfigFile: 'js/afterwriting-bootstrap.js',
					include: ["libs/require", "afterwriting-bootstrap"],
					out: "bundle/js/afterwriting.js",
					onBuildWrite: function (moduleName, path, contents) {
						if (moduleName === 'logger') {
							contents = contents.replace(/\/\/invoke[\s\S]*\/\/\/invoke/g, '');
						} else if (moduleName === 'libs/codemirror/lib/codemirror' || moduleName === 'pdfkit') {
							contents = '';
						}
						return contents;
					},
				}
			}
		},
		concat: {
			bootstrap: {
				options: {
					separator: ''
				},
				src: ['js/main.js', 'js/bootstraps/index.js'],
				dest: 'js/afterwriting-bootstrap.js'

			},
			codemirror: {
				options: {
					separator: ';'
				},
				src: ['bundle/js/afterwriting.js', 'js/libs/codemirror/lib/codemirror.js', 'js/libs/pdfkit.js'],
				dest: 'bundle/js/afterwriting.js'
			}
		},
		clean: {
			prebuild: {
				src: ['bundle/*', 'afterwriting/*'],
				force: true
			},
			bootstrap: ['js/afterwriting-bootstrap.js', 'afterwriting.html']
		},
		cssmin: {
			build: {
				files: {
					'bundle/css/afterwriting.css': ['css/reset.css', 'css/*.css', 'js/libs/**/show-hint.css']
				}
			}
		},
		copy: {
			gfx: {
				expand: true,
				src: ['gfx/**', 'fonts/**'],
				dest: 'bundle'
			},
			html: {
				expand: true,
				flatten: true,
				src: ['html/index.html', 'html/afterwriting.html'],
				dest: ''
			},
			pdfjs: {
				expand: true,
				flatten: true,
				src: ['js/libs/pdfjs/build/pdf.min.js', 'js/libs/pdfjs/build/pdf.min.worker.js'],
				dest: 'bundle/js/pdfjs'
			}
		},
		gitcheckout: {
			pages: {
				options: {
					branch: 'gh-pages'
				}
			},
			master: {
				options: {
					branch: 'master'
				}
			},
			develop: {
				options: {
					branch: 'develop'
				}
			}
		},
		gitmerge: {
			master: {
				options: {
					branch: 'master'
				}
			}
		},
		gitpush: {
			pages: {
				options: {
					branch: 'gh-pages'
				}
			},
			master: {
				options: {
					branch: 'master'
				}
			},
			develop: {
				options: {
					branch: 'develop'
				}
			}
		},
		gitadd: {
			all: {
				options: {
					all: true
				}
			}
		},
		gitcommit: {
			version: {
				options: {
					message: "v<%= pkg.version %>"
				}
			}
		},
		gittag: {
			version: {
				options: {
					tag: "v<%= pkg.version %>"
				}
			}
		},
		compress: {
			build: {
				options: {
					archive: 'afterwriting.zip'
				},
				files: [
					{
						src: 'bundle/**'
					},
					{
						src: 'afterwriting.html'
					}
				]
			}
		},
		replace: {
			last_update: {
				src: ['html/*'],
				overwrite: true,
				replacements: [{
						from: /last_update[=?0-9a-z\-_]*\"/g,
						to: "last_update=<%= grunt.template.today('yyyy-mm-dd_HH-MM') %>\""
                }]
			},
			footer: {
				src: ['js/utils/common.js'],
				overwrite: true,
				replacements: [{
						from: /footer: '[^']*'/g,
						to: "footer: 'version: <%= pkg.version %> (<%= grunt.template.today('yyyy/mm/dd') %>)'"
                }]
			}
		},
		bumpup: 'package.json',
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			check: {
				files: {
					src: ["js/*", "!js/libs/**"]
				}
			}
		},

		template: {
            test: {
                options: {
                    data: {
                        mode: "__TEST",
                        specs: test_specs_list
                    }
                },
                files: {
                    'test/runner.html': ['test/template/runner.template']
                }
            },
            integration: {
                options: {
                    data: {
                        mode: "__TEST",
                        specs: integration_specs_list
                    }
                },
                files: {
                    'test/integration-runner.html': ['test/template/integration.test.template']
                }
            },
            acceptance: {
				options: {
					data: {
						specs: acceptance_specs_list
					}
				},
				files: {
					'test/acceptance/tests.js': ['test/template/acceptance.tests.template']
				}
			},
			coverage: {
				options: {
					data: {
						mode: "__COVERAGE",
						specs: test_specs_list
					}
				},
				files: {
					'test/coverage.html': ['test/template/runner.template']
				}
			}
		},

		shell: {
			istanbul_instrument: {
				command: 'istanbul instrument --output coverage/js --no-impact js && istanbul instrument --output coverage/templates --no-impact templates'

			},
			jsdoc: {
				command: 'jsdoc -c jsdoc.conf.json'
			}
		},

		mocha: {
			coverage: {
				src: ['test/coverage.html'],
				options: {
					run: false,
					coverage: {
						htmlReport: 'coverage/html'
					}
				}
			},
			test: {
				src: ['test/runner.html']
			},
            integration: {
                src: ['test/integration-runner.html']
            },
			acceptance: {
				src: ['dev.html'],
				options: {
					reporter: 'Spec',
					log: false,
					logErrors: true
				}
			}
		},

	});

	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-git');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-mocha-phantom-istanbul')
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-template');

	grunt.registerTask('test', ['handlebars:test', 'template:test', 'template:integration', 'template:acceptance', 'mocha:test', 'mocha:integration', 'mocha:acceptance']);
	grunt.registerTask('coverage', ['template:coverage', 'shell:istanbul_instrument', 'mocha:coverage']);
	grunt.registerTask('doc', ['shell:jsdoc']);

	grunt.registerTask('build', ['test', 'clean:prebuild', 'handlebars:compile', 'replace', 'concat:bootstrap', 'requirejs', 'concat:codemirror', 'cssmin', 'copy', 'compress', 'doc', 'clean:bootstrap']);

	grunt.registerTask('release', ['gitadd:all', 'gitcommit:version', 'gittag:version', 'gitcheckout:pages', 'gitmerge:master', 'gitpush:pages', 'gitcheckout:develop', 'gitmerge:master', 'gitpush:master', 'gitpush:develop']);

};