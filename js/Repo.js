app.factory('Repo', [function() {

	const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

	function Repo(body) {
		this.name = body.name;
		this.description = body.description;
		this.homepage = body.homepage;
		// this.createdAt = body.createdAt;
		this.createdAt = moment(body.createdAt).format(DATE_FORMAT);
		// this.updatedAt = body.updatedAt;
		this.updatedAt = moment(body.createdAt).format(DATE_FORMAT);
		// this.pushedAt = body.pushedAt;
		this.pushedAt = moment(body.createdAt).format(DATE_FORMAT);
		this.commitsCount = body.commitsCount;
		this.contributorsCount = body.contributorsCount;
		this.watchersCount = body.watchersCount;
		this.starsCount = body.starsCount;
		this.forksCount = body.forksCount;
		this.openIssuesCount = body.openIssuesCount;
	}

	return Repo;

}]);