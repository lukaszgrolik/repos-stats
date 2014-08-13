app.controller('MainController', ['$scope', '$http', 'Repo', 'RateLimit', 'UserRecentRequests', '$firebase', function($scope, $http, Repo, RateLimit, UserRecentRequests, $firebase) {

	$scope.recentComparisons = UserRecentRequests.requests;
	$scope.globalRecentComparisons = [];
	$scope.loading = false;
	$scope.loadingStats = false;

	$scope.requestsPerRepo = 1;
	$scope.totalRequests = 0;

	$scope.repos = [];
	$scope.reposNames = '';
	$scope.reposNamesCount = obtainReposNamesCount();
	$scope.repoSortOrder = false;

	$scope.rateLimit = false;

	$scope.$watch(function() {
		return $scope.reposNames;
	}, function() {
		$scope.reposNamesCount = obtainReposNamesCount();
	})

	$scope.connectionError = false;
	$scope.limitError = false;
	$scope.requestRepoError = false;

	$scope.requestReposForm = {};
	$scope.requestReposForm.errors = {}
	$scope.requestReposForm.errors.fields = {};
	$scope.requestReposForm.errors.requests = {};
	$scope.requestReposForm.errors.requests = {};

	$scope.$watch(function() {
		return $scope.requestReposForm.errors.requests
	}, function() {
		$scope.requestRepoError = Boolean(Object.keys($scope.requestReposForm.errors.requests).length);
	}, true);

	$scope.stats = [
		// {
		// 	name: 'commits',
		// 	label: 'Commits'
		// },
		{
			name: 'watchers',
			label: 'Watchers',
			color: '#1ABC9C'
		},
		{
			name: 'stars',
			label: 'Stars',
			color: '#2ECC71'
		},
		{
			name: 'forks',
			label: 'Forks',
			color: '#3498DB'
		},
		{
			name: 'openIssues',
			label: 'Open issues',
			color: '#9B59B6'
		}
	];

	$scope.comparisonsExamples = [
		[
			'angular/angular.js',
			'emberjs/ember.js',
			'jashkenas/backbone',
			'knockout/knockout'
		],
		[
			'strongloop/express',
			'balderdashy/sails',
			'meteor/meteor',
			'koajs/koa',
			'derbyjs/derby',
		],
		[
			'sass/sass',
			'less/less.js',
			'LearnBoost/stylus'
		],
		[
			'symfony/symfony',
			'silexphp/Silex',
			'zendframework/zf2',
			'laravel/laravel',
			'phalcon/cphalcon'
		]
	];

	$scope.charts = {};

	$scope.stats.forEach(function(stat) {
		$scope.charts[stat.name] = {
			labels: ["repo1", "repo2"],
		    datasets: [
		        {
		        	// label: 'aaa',
		            // fillColor : "rgba(151,187,205,0)",
		            fillColor : stat.color,
		            // strokeColor : "#e67e22",
		            // pointColor : "rgba(151,187,205,0)",
		            // pointStrokeColor : "#e67e22",
		            data : [102, 32]
		        }
	    	]
		}
	});

	// $scope.myChartOptions = {
	// 	multiTooltipTemplate: "<%= value %>",
	// 	// tooltipTemplate: "x<%= value %>",
	// 	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	// }

	;(function() {
		// var ref = new Firebase("https://sizzling-fire-8776.firebaseio.com/reposRequests");
		// var sync = $firebase(ref);

		// $scope.globalRecentComparisons = sync.$asArray();
		$scope.globalRecentComparisons = [];

		loadRateLimit(function(err, data) {
			if (err) {
				// return done(err);
				return;
			}

			var body = {
				coreLimit: data.resources.core.limit,
				coreRemaining: data.resources.core.remaining,
				coreReset: new Date(data.resources.core.reset * 1000),
				searchLimit: data.resources.search.limit,
				searchRemaining: data.resources.search.remaining,
				searchReset: new Date(data.resources.search.reset * 1000),
			};

			$scope.rateLimit = new RateLimit(body);


			// done(null);
		});
	})()

	$scope.loadStatsByForm = function() {
		if ('' === $scope.reposNames.trim()) {
			$scope.requestReposForm.errors.fields.reposNames = {
				type: 'empty'
			}

			return;
		}

		var reposNames = $scope.reposNames.split(',');

		reposNames.forEach(function(repoName, i) {
			reposNames[i] = repoName.trim();

			if ('' === repoName) {
				reposNames.splice(i, 1);
			}
		});

		$scope.loadStats(reposNames);
	}

	$scope.loadStats = function(reposNames) {
		$scope.repos.length = 0;
		$scope.requestReposForm.errors.fields = {};
		$scope.requestReposForm.errors.requests = {};
		$scope.loadingStats = true;

		UserRecentRequests.add(reposNames);

		// $scope.globalRecentComparisons.$add(angular.copy(reposNames));

		async.each(
			reposNames,
			function(repoName, next) {
				async.waterfall(
					[
						// request contributors stats
						function(done) {
							if ($scope.requestReposForm.commits) {
								loadCommitActivity(repoName, function(err, resData) {
									// console.log('repoName',repoName)
									// console.log('resData',resData)
									if (err) {
										return done(err);
									}

									var data = {}
									data.commitsCount = 0;

									resData.forEach(function(week) {
										data.commitsCount += week.total;
									});

									done(null, data)
								});
							} else {
								done(null, {});
							}
						},
						// request repo
						function(commitActivityData, done) {
							loadRepoStats(repoName, function(err, data) {
								if (err) {
									$scope.requestReposForm.errors.requests[repoName] = {

									};

									return done(err);
								}

								var body = {
									name: data.full_name,
									description: data.description,
									homepage: data.homepage,
									createdAt: data.created_at,
									updatedAt: data.updated_at,
									pushedAt: data.pushed_at,
									commitsCount: commitActivityData.commitsCount,
									contributorsCount: data.contributorsCount,
									watchersCount: data.subscribers_count,
									starsCount: data.stargazers_count,
									forksCount: data.forks_count,
									openIssuesCount: data.open_issues_count,
								};

								$scope.repos.push(new Repo(body));

								$scope.stats.forEach(function(stat) {
									$scope.charts[stat.name].labels.length = 0;
									$scope.charts[stat.name].datasets[0].data.length = 0;
								});

								$scope.repos.forEach(function(repo) {
									$scope.stats.forEach(function(stat) {
										$scope.charts[stat.name].labels.push(repo.name);
										$scope.charts[stat.name].datasets[0].data.push(repo[stat.name + 'Count']);
									});
								});

								done(null)
							});
						},

						// request rate limit
						function(done) {
							loadRateLimit(function(err, data) {
								if (err) {
									return done(err);
								}

								var body = {
									coreLimit: data.resources.core.limit,
									coreRemaining: data.resources.core.remaining,
									coreReset: new Date(data.resources.core.reset * 1000),
									searchLimit: data.resources.search.limit,
									searchRemaining: data.resources.search.remaining,
									searchReset: new Date(data.resources.search.reset * 1000),
								};

								$scope.rateLimit = new RateLimit(body);

								// console.log('$scope.rateLimit', $scope.rateLimit)

								done(null);
							});
						}
					],
					function(err) {
						next(err);
					}
				)
			},
			function(err) {
				if (err) {
					console.log('error', err);
				}

				$scope.loadingStats = false;
			}
		);
	}

	var lastSortedBy = null;

	$scope.sortRepoByField = function(fieldName) {
		$scope.repoSortField = fieldName;

		if (fieldName === lastSortedBy) {
			$scope.repoSortOrder = !$scope.repoSortOrder;
		} else {
			$scope.repoSortOrder = true; // sort descending by default
		}

		lastSortedBy = fieldName;
	}

	$scope.obtainLink = function(link) {
		var result = link;

		if (false === /^https?:\/\//i.test(link)) {
		    result = 'http://' + link;
		}

		return result;
	}

	$scope.setRepos = function(repos) {
		$scope.reposNames = repos.join(', ');

		$scope.requestsPerRepo = 1;

		if ($scope.requestReposForm.commits) {
			$scope.requestsPerRepo += 1;
		}

		$scope.totalRequests = $scope.requestsPerRepo * repos.length;
	}

	//
	//
	//

	function obtainReposNamesCount() {
		// var result = $scope.reposNames.split(',').length;
		var result = 0;
		var reposNames = $scope.reposNames.split(',');

		reposNames.forEach(function(repoName, i) {
			reposNames[i] = repoName.trim();

			if ('' === repoName) {
				reposNames.splice(i, 1);
			}
		});

		result = reposNames.length;

		return result;
	}

	function loadRepoStats(repoName, callback) {
		var basePath = 'https://api.github.com';
		var path = basePath + '/repos/' + repoName;

		makeRequest(path, function(err, data) {
			if (err) {
				return callback({repo: repoName}, null);
			}

			callback(null, data);
		});
	}

	function loadContributors(repoName, callback) {
		var basePath = 'https://api.github.com';
		var path = basePath + '/repos/' + repoName + '/stats/contributors';

		makeRequest(path, function(err, data) {
			if (err) {
				return callback({error: true}, null);
			}

			callback(null, data);
		});
	}

	function loadCommitActivity(repoName, callback) {
		var basePath = 'https://api.github.com';
		var path = basePath + '/repos/' + repoName + '/stats/commit_activity';

		makeRequest(path, function(err, data) {
			if (err) {
				return callback({error: true}, null);
			}

			callback(null, data);
		});
	}

	function loadRateLimit(callback) {
		var basePath = 'https://api.github.com';
		var path = basePath + '/rate_limit';

		makeRequest(path, function(err, data) {
			if (err) {
				$scope.connectionError = true;

				return callback({error: true}, null);
			}

			$scope.connectionError = false;

			if (data.resources.core.remaining < 1) {
				$scope.limitError = true;
			} else {
				$scope.limitError = false;
			}

			callback(null, data);
		});
	}

	function makeRequest(path, callback) {
		$scope.loading = true;
		// console.log('requested path', path)

		$http
	    .get(path)
	    .success(function(data, status, headers, config) {
	    	$scope.loading = false;

			callback(null, data);
	    })
	    .error(function(data, status, headers, config) {
	    	$scope.loading = false;

			callback({err: true}, null);
	    });
	}



}]);