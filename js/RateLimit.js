app.factory('RateLimit', [function() {

	function RateLimit(body) {
		this.coreLimit = body.coreLimit;
		this.coreRemaining = body.coreRemaining;
		this.coreReset = body.coreReset;
		this.searchLimit = body.searchLimit;
		this.searchRemaining = body.searchRemaining;
		this.searchReset = body.searchReset;
	}

	return RateLimit;

}]);