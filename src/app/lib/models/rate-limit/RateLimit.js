angular.module('app')
.factory('RateLimit', function() {

  const FIELDS = [
    'coreLimit',
    'coreRemaining',
    'coreReset',
    'searchLimit',
    'searchRemaining',
    'searchReset',
  ];
  const DATE_FORMAT = 'HH:mm';

  function RateLimit(body) {
    _(FIELDS).each(function(field) {
      this[field] = body[field];
    }.bind(this));
  }

  _(RateLimit).extend({
    deserialize: function(data) {
      var result = _({}).extend(data, {
        coreLimit: data.resources.core.limit,
        coreRemaining: data.resources.core.remaining,
        coreReset: moment(data.resources.core.reset * 1000).format(DATE_FORMAT),
        searchLimit: data.resources.search.limit,
        searchRemaining: data.resources.search.remaining,
        searchReset: moment(data.resources.search.reset * 1000).format(DATE_FORMAT),
      });

      return result;
    },
  });

  return RateLimit;

});