angular.module('app.reposTableArea')
.directive('reposTableArea', function($templateCache) {

  return {
    restrict: 'A',
    replace: true,
    template: $templateCache.get('partials/repos-table-area/repos-table-area.html'),
    scope: {},
    controller: 'ReposTableAreaCtrl',
  };

});