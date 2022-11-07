const { gql } = require("apollo-server-cloudflare");

const typeDefs = gql`
  type Query {
    hostedzones: [String]
  }
`;

module.exports = typeDefs;
