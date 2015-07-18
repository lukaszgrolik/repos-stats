angular.module('app.reposChartsArea')
.directive('reposChartsArea', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('partials/repos-charts-area/repos-charts-area.html'),
    scope: {},
    controller: 'ReposChartsAreaCtrl',
  };

});