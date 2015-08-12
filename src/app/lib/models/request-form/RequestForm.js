angular.module('app.requestForm', function() {

  function RequestForm() {
    this.state = {};
    this.pending = false;
    this.errors = {
      fields: {},
      requests: {},
    };
  }

  _(RequestForm.prototype).extend({
    submit: function() {
      if ('' === reposStore.reposNames.trim()) {
        this.requestReposForm.errors.fields.reposNames = {
          type: 'empty',
        };

        return;
      }

      loadStats.apply(this, [this.parseReposNames()]);
    },
    parseReposNames: function() {
      var result = reposStore.reposNames.split(',');

      _(reposNames).each(function(repoName, i) {
        reposNames[i] = repoName.trim();
      });

      _(reposNames).compact();

      return result;
    },
  });

  function loadStats(reposNames) {
    console.log('loadStats')
    reposStore.repos.length = 0;

    this.errors.fields = {};
    this.errors.requests = {};
    this.pending = true;

    UserRecentRequests.add(reposNames);

    var promises = _(reposNames).map(function(repoName) {
      return loadRepoStats(repoName);
      // .catch(function(err) {
      //   $scope.requestReposForm.errors.requests[repoName] = {};

      //   return done(err);
      // })
    });

    $q.all(promises)
    .then(function() {
      this.pending = false;
    }.bind(this))
    .catch(function(err) {
      console.log('error', err);
    });
  }

  function loadRepoStats(repoName) {
    console.log('loadRepoStats')
    return ghApi.getRepo({name: repoName})
    .then(function(data) {
      reposStore.repos.push(new Repo(Repo.deserialize(data)));

      statsConfig.forEach(function(stat) {
        chartsStore[stat.name].labels.length = 0;
        chartsStore[stat.name].datasets[0].data.length = 0;
      });

      reposStore.repos.forEach(function(repo) {
        statsConfig.forEach(function(stat) {
          chartsStore[stat.name].labels.push(repo.name);
          chartsStore[stat.name].datasets[0].data.push(repo[stat.name + 'Count']);
        });
      });

      return loadRateLimit();
    })
    .catch(function(err) {
      return {repo: repoName};
    });
  }

  function loadRateLimit() {
    console.log('loadRateLimit')
    return ghApi.getRateLimit()
    .then(function(data) {
      this.connectionError = false;

      if (data.resources.core.remaining < 1) {
        this.limitError = true;
      } else {
        this.limitError = false;
      }

      return data;
    }.bind(this))
    .then(function(data) {
      console.log('x')
      requestData.rateLimit = new RateLimit(RateLimit.deserialize(data));
    })
    .catch(function(err) {
      console.log('y')
      this.connectionError = true;

      return {error: true};
    }.bind(this));
  }

  return RequestForm;

});