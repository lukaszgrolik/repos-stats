app.factory('RateLimit', [function() {

	function RateLimit(body) {
		this.coreLimit = body.coreLimit;
		this.coreRemaining = body.coreRemaining;
		// this.coreReset = body.coreReset;
		this.coreReset = moment(body.coreReset).format('HH:mm');
		this.searchLimit = body.searchLimit;
		this.searchRemaining = body.searchRemaining;
		// this.searchReset = body.searchReset;
		this.searchReset = moment(body.searchReset).format('HH:mm');
	}

	return RateLimit;

}]);