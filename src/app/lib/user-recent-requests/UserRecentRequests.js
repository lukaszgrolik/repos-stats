angular.module('app')
.service('UserRecentRequests', function() {

	this.REPOS_REQUESTS_STORAGE_KEY = 'reposRequests'
	this.REPOS_LIMIT = 5;
	this.requests = JSON.parse(localStorage.getItem(this.REPOS_REQUESTS_STORAGE_KEY)) || [];
	this.globalRequests = [];

	this.add = function(reposNames) {
		var _this = this;

		this.requests.forEach(function(request, i) {
			if (request.join() === reposNames.join()) {
				_this.requests.splice(i, 1);
			}
		});

		this.requests.unshift(reposNames);

		if (this.requests.length > this.REPOS_LIMIT) {
			this.requests.length = this.REPOS_LIMIT;
		}

		localStorage.setItem(this.REPOS_REQUESTS_STORAGE_KEY, JSON.stringify(this.requests));
	}

});