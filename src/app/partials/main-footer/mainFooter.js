angular.module('app.mainFooter')
.directive('mainFooter', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('partials/main-footer/main-footer.html'),
    scope: {},
    controller: 'MainFooterCtrl',
  };

});