

CREATE TABLE ArticleSummary (
	Article VARCHAR(50),
	Summary VARCHAR(2000),
	Redirect BINARY,
	PRIMARY KEY(Article)
);

CREATE TABLE ArticleRelations (
	ArticleID VARCHAR(50),
	RelatedArticle VARCHAR(50),
	Strength INT
);

CREATE TABLE ArticleImages (
	Article VARCHAR(50),
	ArticleURL VARCHAR(150),
	PRIMARY KEY(Article)
);


