CREATE TABLE ArticleRelations (
  Article varchar(300),
  RelatedArticle varchar(300),
  STRENGTH int(11),
  PRIMARY KEY (Article,RelatedArticle)
);


CREATE TABLE ArticleSummary (
  Article varchar(300) NOT NULL,
  Summary varchar(10000) DEFAULT NULL,
  Redirect binary(1) DEFAULT NULL,
  PRIMARY KEY (Article)
);


CREATE TABLE ArticleImages (
  Article varchar(300),
  ArticleURL varchar(500),
  PRIMARY KEY (Article)
);


CREATE TABLE TreeCache (
Article varchar(300) NOT NULL,
MaxDepth int(2) NOT NULL, 
DepthArray varchar(50) NOT NULL, 
Tree varchar(4500) DEFAULT NULL,
Timestamp int(11) DEFAULT NULL,
PRIMARY KEY(Article, MaxDepth, DepthArray)
);


