"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const doc = {
    info: {
        version: "1.0.0",
        title: "API Getway",
        description: "API Getway",
    },
    host: "localhost:8081",
    schemes: ["http"],
};
const outputFile = "/src/swagger-output.json";
const endpointsFiles = ["./src/index.js"];
(0, swagger_autogen_1.default)(outputFile, endpointsFiles, doc);
