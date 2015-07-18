angular.module('app.<%= jsName %>')
.config(function($stateProvider) {

  $stateProvider
  .state('<%= jsName %>', {
    url: '/<%= hyphenName %>',
    views: {
      main: {
        templateProvider: function($templateCache) {
          return $templateCache.get('<%= hyphenName %>/<%= hyphenName %>.html');
        },
        controller: '<%= pcName %>Ctrl',
      },
    },
  });

})
.directive('<%= jsName %>', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('<%= hyphenName %>/<%= hyphenName %>.html'),
    scope: {},
    controller: '<%= pcName %>Ctrl',
  };

});