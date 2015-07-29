angular.module('app.defaultLayout')
.directive('defaultLayout', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('layouts/default-layout/default-layout.html'),
    scope: {},
    controller: 'DefaultLayoutController',
  };

});