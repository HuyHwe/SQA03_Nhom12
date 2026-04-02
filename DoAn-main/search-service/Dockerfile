# Maven build container
#https://www.baeldung.com/dockerizing-spring-boot-application
FROM maven:3.8.6-openjdk-11 AS maven_build
WORKDIR /tmp/
#We let Docker copy
COPY pom.xml /tmp/
RUN mvn dependency:go-offline
COPY src /tmp/src/
#COPY ~/.m2/repository/com/jober/utils-service/0.0.1-SNAPSHOT/ ~/.m2/repository/com/jober/utils-service/0.0.1-SNAPSHOT
RUN mvn package -Dmaven.test.skip=true


#pull base image
FROM eclipse-temurin:11-jre
EXPOSE 2002
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -Dlog4j2.formatMsgNoLookups=true -jar /app.jar" ]
COPY --from=maven_build /tmp/target/*.jar /app.jar
