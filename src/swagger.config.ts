// swagger.config.ts
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "A REST API application made with Express and TypeScript.",
    },
    servers: [
      {
        url: "/api",
        description: "API Server",
      },
    ],
  },
  apis: ["./dist/routes/*.js"], // Path to your compiled route files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
