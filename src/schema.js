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
    dnssec(hostedzone_id: String!): GetDNSSECResponse
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
    delete_hostedzone(id: String!): ChangeInfoResponse
    insert_reusable_delegation_set(
      caller_reference: String!
      hostedzone_id: String
    ): ReusableDelegationSetResponse
    delete_reusable_delegation_set(id: String!): GeneralResponse
    insert_recordset(RecordSet: RecordSetInput!): RecordSet
    update_recordsets(
      hostedzone_id: String!
      RecordSet: [RecordSetInput!]
      comment: String
    ): ChangeInfoResponse
    enable_dnssec_hostedzone(hostedzone_id: String!): ChangeInfoResponse
    disable_dnssec_hostedzone(hostedzone_id: String!): ChangeInfoResponse
    insert_keysigningkey(
      caller_reference: String
      hostedzone_id: String!
      keymanagement_service_arn: String!
      nane: String!
      status: String!
    ): KSKChangeInfoResponse
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

  type ChangeInfoResponse {
    Id: String
    Status: String
    SubmittedAt: String
    Comment: String
  }

  type KSKChangeInfoResponse {
    ChangeInfo: ChangeInfoResponse
    KeySigningKey: KeySigningKey
    Location: String
  }

  type GeneralResponse {
    Status: String
    Message: String
  }

  input PrivateHostedVPC {
    VPCId: String
    VPCRegion: String
  }

  type DNSSECStatus {
    ServerSignature: String
    StatusMessage: String
  }

  type KeySigningKey {
    Name: String
    KmsArn: String
    Flag: Int
    SigningAlgorithmMnemonic: String
    SigningAlgorithmType: Int
    DigestAlgorithmMnemonic: String
    DigestAlgorithmType: Int
    KeyTag: Int
    PublicKey: String
    DSRecord: String
    DNSKEYRecord: String
    Status: String
    StatusMessage: String
    CreatedDate: String
    LastModifiedDate: String
  }

  type GetDNSSECResponse {
    Status: DNSSECStatus
    KeySigningKeys: [KeySigningKey]
  }
`;

module.exports = typeDefs;
