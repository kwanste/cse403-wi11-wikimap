

CREATE TABLE ArticleImages (
  Article varchar(300),
  ArticleURL varchar(500),
  PRIMARY KEY (Article)
);


CREATE TABLE ArticleRelations (
  Article varchar(300),
  RelatedArticle varchar(300),
  STRENGTH int(11),
  PRIMARY KEY (Article,RelatedArticle)
);


CREATE TABLE ArticleSummary (
  Article varchar(300),
  Summary varchar(10000),
  Redirect binary(1),
  PRIMARY KEY (Article)
);


CREATE TABLE TreeCache (
Article VARCHAR(300),
DepthArray VARCHAR(50), 
Tree VARCHAR(10000),
PRIMARY KEY(Article)
);


