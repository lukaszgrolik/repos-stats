angular.module('app.mainHeader')
.directive('mainHeader', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('partials/main-header/main-header.html'),
    scope: {},
    controller: 'MainHeaderCtrl',
  };

});