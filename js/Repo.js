app.factory('Repo', [function() {

	function Repo(body) {
		this.name = body.name
		this.description = body.description
		this.homepage = body.homepage
		this.createdAt = body.createdAt
		this.updatedAt = body.updatedAt
		this.pushedAt = body.pushedAt
		this.commitsCount = body.commitsCount;
		this.contributorsCount = body.contributorsCount;
		this.watchersCount = body.watchersCount
		this.starsCount = body.starsCount
		this.forksCount = body.forksCount
		this.openIssuesCount = body.openIssuesCount
	}

	return Repo;

}]);