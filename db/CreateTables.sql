

CREATE TABLE `articleimages` (
  `Article` varchar(10) NOT NULL DEFAULT '',
  `ArticleURL` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Article`)
);

delimiter $$

CREATE TABLE `articlerelations` (
  `Article` varchar(100) NOT NULL,
  `RelatedArticle` varchar(300) NOT NULL,
  `STRENGTH` int(11) DEFAULT NULL,
  PRIMARY KEY (`Article`,`RelatedArticle`)
);


CREATE TABLE `articlesummary` (
  `Article` varchar(100) NOT NULL DEFAULT '',
  `Summary` varchar(10000) DEFAULT NULL,
  `Redirect` binary(1) DEFAULT NULL,
  PRIMARY KEY (`Article`)
);


CREATE TABLE TreeCache (
Article VARCHAR(100),
ZoomLevel INT(11), 
Tree VARCHAR(10000),
PRIMARY KEY(Article)
);


