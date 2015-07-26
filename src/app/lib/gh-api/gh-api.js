angular.module('app.ghApi', [])
.factory('ghApi', function($http) {

  return {
    baseUrl: 'https://api.github.com',

    getRepo: function(data) {
      return $http({
        url: this.baseUrl + '/repos/' + data.name,
      })
      .then(function(ok) {
        return ok.data;
      })
      .catch(function(err) {
        return err;
      });
    },

    getRateLimit: function() {
      return $http({
        url: this.baseUrl + '/rate_limit',
      })
      .then(function(ok) {
        return ok.data;
      })
      .catch(function(err) {
        return err;
      });
    },
  };

});