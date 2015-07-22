angular.module('app.mainFooter')
.controller('MainFooterCtrl', function($scope, requestData) {

  //
  // HELPERS
  //

  $scope.faq = getFaq();

  $scope.$watch(function() {
    return requestData.rateLimit.searchLimit;
  }, function() {
    $scope.faq = getFaq();
  });

  //
  // EVENTS
  //

  //
  // OTHER
  //

  function getFaq() {
    return [
      {
        question: 'Why the number of requests is limited?',
        answer: 'GitHub limits number of API requests to {{rateLimit.coreLimit}} per hour.',
      },
      {
        question: 'Why the number of remaining requests does not decrease when I make requests?',
        answer: 'GitHub caches API calls. The cache for specific repository is being reset when this repository updates.',
      },
      {
        question: 'Why there is no search functionality for repositories?',
        // @fix
        answer: 'GitHub has separate limit for searching - it is only ' + requestData.rateLimit.searchLimit + ' requests per hour, so I decided not to implement front-end search functionality for now. Thus, you have to enter repositories\' names manually.'
      },
    ];
  }

});