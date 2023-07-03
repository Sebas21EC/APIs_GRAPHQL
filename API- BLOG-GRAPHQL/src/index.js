const { ApolloServer } = require("apollo-server");
const { fileLoader, mergeTypes } = require("merge-graphql-schemas");

const typeDefs = mergeTypes(fileLoader('schema/blogs.graphql'));
const resolvers = require("../controllers/blog_controller.js");

//definir el server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const port=4001;

server.listen(port).then(({ url }) => {
    console.log(`🚀 Run server in the URL: ${url}`);
  });