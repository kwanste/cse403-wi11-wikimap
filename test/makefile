JAVAC = javac
CLASS_FILES = frontendUITest.class
CLASS_PATH = ./Front-EndUI

Default: $(CLASS_FILES)
	$(JAR_CMD) $(JAR_NAME) $(CLASS_FILES)

%.class: %.java
	$(JAVAC) -cp $(CLASS_PATH) $<

clean:
	rm */*.class $(JAR_NAME)
