# This Makefile will build a jar file (Chat.jar) out of a set of
# three class files. This is the coolest way to rebuild your java
# files selectively after making some changes. Just type 'make'.

JAVAC = javac
CLASS_FILES = manifest.txt communication/DatabaseUpdater.class logic/WikiParser.class logic/ArticleVector.class logic/DumpUpdater.class logic/RelationshipBuilder.class
JAR_CMD = jar cfm
JAR_NAME = wikimap.jar
CLASS_PATH = .:shared/*.jar

Default: $(CLASS_FILES)
	$(JAR_CMD) $(JAR_NAME) $(CLASS_FILES)

%.class: %.java
	$(JAVAC) -cp $(CLASS_PATH) $<

clean:
	rm */*.class $(JAR_NAME)
