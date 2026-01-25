# Maven build container
FROM maven:3.8.6-openjdk-11 AS maven_build
WORKDIR /tmp/
COPY pom.xml /tmp/
RUN mvn dependency:go-offline
COPY src /tmp/src/
RUN mvn package -Dmaven.test.skip=true


#pull base image
FROM eclipse-temurin:11-jre
EXPOSE 2006
ENV JAVA_OPTS="-Xms3072m -Xmx4096m -XX:PermSize=512m -XX:MaxPermSize=1024m"
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -Dlog4j2.formatMsgNoLookups=true -jar /app.jar" ]
COPY --from=maven_build /tmp/target/*.jar /app.jar
