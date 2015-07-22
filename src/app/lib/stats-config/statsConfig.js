angular.module('app.statsConfig', [])
.factory('statsConfig', function() {

  return [
    {
      name: 'watchers',
      label: 'Watchers',
      color: '#1ABC9C'
    },
    {
      name: 'stars',
      label: 'Stars',
      color: '#2ECC71'
    },
    {
      name: 'forks',
      label: 'Forks',
      color: '#3498DB'
    },
    {
      name: 'openIssues',
      label: 'Open issues',
      color: '#9B59B6'
    }
  ];

});