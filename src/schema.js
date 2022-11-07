const { gql } = require("apollo-server-cloudflare");

const typeDefs = gql`
  type Query {
    hostedzones: [HostedZone]
    hostedzone_recordsets(id: String): [RecordSet]
  }

  type Mutation {
    insert_hostedzone(name: String!): HostedZone
    update_hostedzone(id: String!, name: String!): HostedZone
    delete_hostedzone(id: String!): HostedZone
    insert_recordset(RecordSet: RecordSetInput!): RecordSet
    update_recordset(RecordSet: RecordSetInput!): RecordSet
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

  type ResourceRecord {
    Value: String
  }

  type RecordSet {
    Name: String
    Type: String
    TTL: Int
    ResourceRecords: [ResourceRecord]
  }

  input RecordSetInput {
    id: String
    name: String
    type: String
    ttl: Int
    values: [String]
  }

`;

module.exports = typeDefs;
