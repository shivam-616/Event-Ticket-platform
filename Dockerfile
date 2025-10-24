# --- Build Stage ---
# Use a Maven image to build the application JAR
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven wrapper files first
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (leverages Docker cache)
# RUN ./mvnw dependency:go-offline
# Note: dependency:go-offline might fail if pom changes often, you can remove it if needed

# Copy the source code
COPY src ./src

# Build the application JAR, skipping tests
# Ensure this command successfully creates the JAR in /app/target/
RUN ./mvnw package -DskipTests

# --- Final Stage ---
# Use a slim Java runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage's target directory
# Ensure the JAR filename here EXACTLY matches the one produced by the build
COPY --from=build /app/target/tickets-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# Command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]