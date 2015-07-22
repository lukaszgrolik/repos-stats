angular.module('app.mainHeader')
.controller('MainHeaderCtrl', function($scope, $http, Repo, RateLimit, UserRecentRequests, statsConfig, chartsStore, reposStore) {

  //
  // HELPERS
  //

  $scope.reposStore = reposStore;

  $scope.recentComparisons = UserRecentRequests.requests;
  $scope.globalRecentComparisons = [];
  $scope.loading = false;
  $scope.loadingStats = false;

  $scope.requestsPerRepo = 1;
  $scope.totalRequests = 0;

  // reposStore.repos = [];
  // reposStore.reposNames = '';
  // reposStore.reposNamesCount = obtainReposNamesCount();
  // reposStore.repoSortOrder = false;

  $scope.rateLimit = false;

  $scope.connectionError = false;
  $scope.limitError = false;
  $scope.requestRepoError = false;

  $scope.requestReposForm = {}
  $scope.requestReposForm.errors = {}
  $scope.requestReposForm.errors.fields = {};
  $scope.requestReposForm.errors.requests = {};
  $scope.requestReposForm.errors.requests = {};

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
      'stylus/stylus'
    ],
    [
      'symfony/symfony',
      'silexphp/Silex',
      'zendframework/zf2',
      'laravel/laravel',
      'phalcon/cphalcon'
    ]
  ];

  //
  // EVENTS
  //

  $scope.setRepos = function(repos) {
    reposStore.reposNames = repos.join(', ');

    $scope.requestsPerRepo = 1;

    $scope.totalRequests = $scope.requestsPerRepo * repos.length;
  }

  $scope.loadStatsByForm = function() {
    if ('' === reposStore.reposNames.trim()) {
      $scope.requestReposForm.errors.fields.reposNames = {
        type: 'empty'
      }

      return;
    }

    var reposNames = reposStore.reposNames.split(',');

    reposNames.forEach(function(repoName, i) {
      reposNames[i] = repoName.trim();

      if ('' === repoName) {
        reposNames.splice(i, 1);
      }
    });

    $scope.loadStats(reposNames);
  }

  $scope.loadStats = function(reposNames) {
    reposStore.repos.length = 0;
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
            // request repo
            function(done) {
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
                  watchersCount: data.subscribers_count,
                  starsCount: data.stargazers_count,
                  forksCount: data.forks_count,
                  openIssuesCount: data.open_issues_count,
                };

                reposStore.repos.push(new Repo(body));

                statsConfig.forEach(function(stat) {
                  chartsStore[stat.name].labels.length = 0;
                  chartsStore[stat.name].datasets[0].data.length = 0;
                });

                reposStore.repos.forEach(function(repo) {
                  statsConfig.forEach(function(stat) {
                    chartsStore[stat.name].labels.push(repo.name);
                    chartsStore[stat.name].datasets[0].data.push(repo[stat.name + 'Count']);
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

  //
  // OTHER
  //

  init();

  function init() {
    watch();

    ;(function() {
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
    })();
  }

  function watch() {
    $scope.$watch(function() {
      return reposStore.reposNames;
    }, function(val) {
      reposStore.reposNamesCount = reposStore.obtainReposNamesCount();
    })



    $scope.$watch(function() {
      return $scope.requestReposForm.errors.requests
    }, function() {
      $scope.requestRepoError = Boolean(Object.keys($scope.requestReposForm.errors.requests).length);
    }, true);
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

});