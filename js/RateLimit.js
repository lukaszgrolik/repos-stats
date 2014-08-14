app.factory('RateLimit', [function() {

	function RateLimit(body) {
		this.coreLimit = body.coreLimit;
		this.coreRemaining = body.coreRemaining;
		this.coreReset = moment(body.coreReset).format('HH:mm');
		this.searchLimit = body.searchLimit;
		this.searchRemaining = body.searchRemaining;
		this.searchReset = moment(body.searchReset).format('HH:mm');
	}

	return RateLimit;

}]);