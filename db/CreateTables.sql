

CREATE TABLE `articleimages` (
  `Article` varchar(50) NOT NULL DEFAULT '',
  `ArticleURL` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`Article`)
);

delimiter $$

CREATE TABLE `articlerelations` (
  `Article` varchar(50) NOT NULL,
  `RelatedArticle` varchar(50) NOT NULL,
  `STRENGTH` int(11) DEFAULT NULL,
  PRIMARY KEY (`Article`,`RelatedArticle`)
);


CREATE TABLE `articlesummary` (
  `Article` varchar(50) NOT NULL DEFAULT '',
  `Summary` varchar(1500) DEFAULT NULL,
  `Redirect` binary(1) DEFAULT NULL,
  PRIMARY KEY (`Article`)
);

