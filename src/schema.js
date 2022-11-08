const { gql } = require("apollo-server-cloudflare");

const typeDefs = gql`
  type Query {
    hostedzones: [HostedZone]
    hostedzone_recordsets(id: String): [RecordSet]
    resusable_delegation_sets: [ReusableDelegationSet]
    resusable_delegation_set(id: String): ReusableDelegationSet
    resusable_delegation_set_limit(
      id: String
    ): ReusableDelegationSetLimitResponse
  }

  type Mutation {
    insert_hostedzone(
      name: String!
      delegationset_id: String
      is_private_zone: Boolean
      vpc: PrivateHostedVPC
      caller_reference: String
      comment: String
    ): HostedZone
    update_hostedzone(id: String!, comment: String!): HostedZone
    delete_hostedzone(id: String!): HostedZoneChangeInfo
    insert_reusable_delegation_set(caller_reference: String!, hostedzone_id: String): ReusableDelegationSetResponse
    delete_reusable_delegation_set(id: String!): GeneralResponse
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

  type ReusableDelegationSet {
    Id: String
    CallerReference: String
    NameServers: [String]
  }

  type ReusableDelegationSetResponse {
    DelegationSet: ReusableDelegationSet
    Location: String
  }

  type ReusableDelegationSetLimitResponse {
    Count: Int
    Limit: ReusableDelegationSetLimit
  }

  type ReusableDelegationSetLimit {
    Type: String
    Value: Int
  }

  type HostedZoneChangeInfo {
    Id: String
    Status: String
    SubmittedAt: String
    Comment: String
  }

  type GeneralResponse {
    Status: String
    Message: String
  }

  input PrivateHostedVPC {
    VPCId: String
    VPCRegion: String
  }
`;

module.exports = typeDefs;
