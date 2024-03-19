const express = require("express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { ApolloServer } = require("@apollo/server");
const { json } = require("body-parser");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const path = require("path");

const loadedTypes = loadFilesSync("**/*", {
    extensions: ["graphql"],
});

const loadedResolvers = loadFilesSync(path.join(__dirname, "**/*.resolvers.js"));

async function startApolloServer() {
    const PORT = 4000;
    const app = express();

    const schema = makeExecutableSchema({
        typeDefs: loadedTypes,
        resolvers: loadedResolvers,
    });

    const server = new ApolloServer({
        schema,
    });

    await server.start();

    app.use(
        "/graphql",
        cors(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token }),
        })
    );

    app.listen(PORT, () => {
        console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);
    });
}

startApolloServer();
