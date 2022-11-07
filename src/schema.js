const { gql } = require("apollo-server-cloudflare");

const typeDefs = gql`
  type Query {
    hostedzones: [HostedZone]
    hostedzone_recordsets(id: String): [RecordSet]
  }

  type Mutation {
    insert_hostedzone(name: String!): HostedZone
    update_hostedzone(id: ID!, name: String!): HostedZone
    delete_hostedzone(id: ID!): HostedZone
  }

  type HostedZone {
    Id: String
    Name: String
    CallerReference: String
    Config: Config
    ResourceRecordSetCount: Int
    LinkedService: LinkedService
  }

  type Config {
    Comment: String
    PrivateZone: Boolean
  }

  type LinkedService {
    ServicePrincipal: String
    Description: String
  }
`;

module.exports = typeDefs;
