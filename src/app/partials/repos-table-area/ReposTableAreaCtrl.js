angular.module('app.reposTableArea')
.controller('ReposTableAreaCtrl', function($scope) {

  //
  // HELPERS
  //

  $scope.charts = {};

  $scope.stats = [
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

  $scope.stats.forEach(function(stat) {
    $scope.charts[stat.name] = {
      labels: ["repo1", "repo2"],
        datasets: [
            {
                fillColor : stat.color,
                data : [102, 32]
            }
        ]
    }
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