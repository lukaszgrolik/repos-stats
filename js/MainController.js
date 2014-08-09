app.controller('MainController', ['$scope', '$http', 'Repo', 'RateLimit', 'UserRecentRequests', '$firebase', function($scope, $http, Repo, RateLimit, UserRecentRequests, $firebase) {

	$scope.recentComparisons = UserRecentRequests.requests;
	$scope.globalRecentComparisons = [];

	$scope.repos = [];
	$scope.reposNames = '';
	$scope.repoSortOrder = false;

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
			'flatiron/flatiron',
			'jaredhanson/locomotive',
			'totaljs/framework',
			'koajs/koa',
			'1602/compound',
			'geddy/geddy',
			'rhapsodyjs/RhapsodyJS',
			'derbyjs/derby',
			'socketstream/socketstream',
			'yahoo/mojito',
			'dreamerslab/coke',
			'cubettech/sleekjs'
		],
		[
			'sass/sass',
			'less/less.js',
			'LearnBoost/stylus'
		]
	];

	(function() {
		var ref = new Firebase("https://sizzling-fire-8776.firebaseio.com/reposRequests");
		var sync = $firebase(ref);

		$scope.globalRecentComparisons = sync.$asArray();
	})()

	$scope.loadStatsByForm = function() {
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

		UserRecentRequests.add(reposNames);

		$scope.globalRecentComparisons.$add(angular.copy(reposNames));

		async.each(
			reposNames,
			function(repoName, next) {
				async.waterfall(
					[
						function(done) {
							loadRepoStats(repoName, function(err, data) {
								if (err) {
									return done(err);
								}

								var body = {
									name: data.full_name,
									description: data.description,
									homepage: data.homepage,
									createdAt: data.created_at,
									updatedAt: data.updated_at,
									pushedAt: data.pushed_at,
									commitsCount: data.commitsCount,
									contributorsCount: data.contributorsCount,
									watchersCount: data.subscribers_count,
									starsCount: data.stargazers_count,
									forksCount: data.forks_count,
									openIssuesCount: data.open_issues_count,
								};

								$scope.repos.push(new Repo(body));

								done(null)
							});
						},
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

	function loadRepoStats(repoName, callback) {
		$scope.loading = true;

		var basePath = 'https://api.github.com';
		var path = basePath + '/repos/' + repoName;

		$http
	    .get(path)
	    .success(function(data, status, headers, config) {
	    	$scope.loading = false;

			callback(null, data);
	    })
	    .error(function(data, status, headers, config) {
	    	$scope.loading = false;

			callback({error: true}, null);
	    });
	}

	function loadRateLimit(callback) {
		var basePath = 'https://api.github.com';
		var path = basePath + '/rate_limit';

		$http
	    .get(path)
	    .success(function(data, status, headers, config) {
			callback(null, data);
	    })
	    .error(function(data, status, headers, config) {
			callback({error: true}, null);
	    });
	}

}]);