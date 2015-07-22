angular.module('app.reposStore', [])
.factory('reposStore', function() {

  var reposStore = {
    repos: [],
    reposNames: '',
    repoSortOrder: false,
    obtainReposNamesCount: function() {
      // var result = reposStore.reposNames.split(',').length;
      var result = 0;
      var reposNames = this.reposNames.split(',');

      reposNames.forEach(function(repoName, i) {
        reposNames[i] = repoName.trim();

        if ('' === repoName) {
          reposNames.splice(i, 1);
        }
      });

      result = reposNames.length;

      return result;
    },
  };

  reposStore.reposNamesCount = reposStore.obtainReposNamesCount();

  return reposStore;

});