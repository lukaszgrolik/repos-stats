angular.module('app')
.factory('Repo', function() {

  const FIELDS = [
    'name',
    'description',
    'homepage',
    'createdAt',
    'updatedAt',
    'pushedAt',
    'commitsCount',
    'contributorsCount',
    'watchersCount',
    'starsCount',
    'forksCount',
    'openIssuesCount',
  ];
  const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

  function Repo(body) {
    _(FIELDS).each(function(field) {
      this[field] = body[field];
    }.bind(this));
  }

  _(Repo).extend({
    deserialize: function(data) {
      var result = _({}).extend(data, {
        name: data.full_name,
        createdAt: moment(data.created_at).format(DATE_FORMAT),
        updatedAt: moment(data.updated_at).format(DATE_FORMAT),
        pushedAt: moment(data.pushed_at).format(DATE_FORMAT),
        watchersCount: data.subscribers_count,
        starsCount: data.stargazers_count,
        forksCount: data.forks_count,
        openIssuesCount: data.open_issues_count,
      });

      return result;
    },
  });

  return Repo;

});