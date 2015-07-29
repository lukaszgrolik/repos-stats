angular.module('app.mainHeader')
.controller('MainHeaderCtrl', function($scope, $q, $http, Repo, RateLimit, UserRecentRequests, statsConfig, chartsStore, reposStore, requestData, ghApi) {

  //
  // HELPERS
  //

  $scope.reposStore = reposStore;
  $scope.requestData = requestData;

  $scope.recentComparisons = UserRecentRequests.requests;
  $scope.loading = false;
  $scope.loadingStats = false;

  $scope.requestsPerRepo = 1;
  $scope.totalRequests = 0;

  requestData.rateLimit = false;

  $scope.connectionError = false;
  $scope.limitError = false;
  $scope.requestRepoError = false;

  $scope.requestReposForm = {
    errors: {
      fields: {},
      requests: {},
    },
  };

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

  setRepos($scope.comparisonsExamples[0]);

  //
  // EVENTS
  //

  $scope.setRepos = setRepos;

  //
  // OTHER
  //

  init();

  function init() {
    initWatchers();
    loadRateLimit();
  }

  function initWatchers() {
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

  function setRepos(repos) {
    reposStore.reposNames = repos.join(', ');

    $scope.requestsPerRepo = 1;

    $scope.totalRequests = $scope.requestsPerRepo * repos.length;
  }

});