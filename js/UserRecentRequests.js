app.service('UserRecentRequests', ['$firebase', function($firebase) {

	this.requests = JSON.parse(localStorage.getItem('a')) || [];
	this.globalRequests = [];

	this.add = function(reposNames) {
		var _this = this;

		this.requests.forEach(function(request, i) {
			if (request.join() === reposNames.join()) {
				_this.requests.splice(i, 1);
			}
		});

		this.requests.unshift(reposNames);

		localStorage.setItem('a', JSON.stringify(this.requests));
	}



}]);