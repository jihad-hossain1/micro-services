import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "1.0.0",
        title: "API Getway",
        description: "API Getway",
    },
    host: "localhost:8081",
    schemes: ["http"],
};

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
