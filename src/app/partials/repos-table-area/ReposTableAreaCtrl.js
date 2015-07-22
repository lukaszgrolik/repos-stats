angular.module('app.reposTableArea')
.controller('ReposTableAreaCtrl', function($scope, statsConfig, chartsStore, reposStore) {

  //
  // HELPERS
  //

  $scope.reposStore = reposStore

  // $scope.charts = {};

  // @todo
  // $scope.stats = statsConfig;

  statsConfig.forEach(function(stat) {
    chartsStore[stat.name] = {
      labels: ['repo1', 'repo2'],
      datasets: [
        {
          fillColor : stat.color,
          data : [102, 32],
        },
      ],
    };
  });

  $scope.obtainLink = function(link) {
    var result = link;

    if (false === /^https?:\/\//i.test(link)) {
        result = 'http://' + link;
    }

    return result;
  }

  //
  // EVENTS
  //

  //
  // OTHER
  //

});