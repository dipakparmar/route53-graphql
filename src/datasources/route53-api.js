const { RESTDataSource } = require("apollo-datasource-rest");
import {
  Route53Client,
  GetReusableDelegationSetCommand,
  GetReusableDelegationSetLimitCommand,
  ListReusableDelegationSetsCommand,
  DeleteReusableDelegationSetCommand,
  CreateReusableDelegationSetCommand,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommand,
  CreateHostedZoneCommand,
  DeleteHostedZoneCommand,
  UpdateHostedZoneCommentCommand,
  GetDNSSECCommand,
  EnableHostedZoneDNSSECCommand,
  DisableHostedZoneDNSSECCommand,
  CreateKeySigningKeyCommand,
  DeleteKeySigningKeyCommand,
  ActivateKeySigningKeyCommand,
  DeactivateKeySigningKeyCommand,
} from "@aws-sdk/client-route-53";

class Route53API extends RESTDataSource {
  constructor(context) {
    super();
    this.params = {};
    this.context = context;
    this.client;
  }

  setParams() {
    this.params.accessKeyId = this.context.headers.get("x-access-key");
    this.params.secretAccessKey = this.context.headers.get("x-access-secret");
    this.params.sessionToken = this.context.headers.get("x-session-token");
  }

  setupClient() {
    this.client = new Route53Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: this.params.accessKeyId,
        secretAccessKey: this.params.secretAccessKey,
        sessionToken: this.params.sessionToken,
      },
      customUserAgent: "route53.dipak.io (Language=JavaScript) (Version=1.0.0)",
    });
  }

  async generateCallerReference() {
    return "" + Date.now().toLocaleString();
  }

  async getReusableDelegationSets() {
    this.setParams();
    this.setupClient();
    let delegationsets = [];
    try {
      let data = await this.client.send(
        new ListReusableDelegationSetsCommand({
          MaxItems: "100",
        })
      );
      delegationsets = data.DelegationSets;
      while (data.IsTruncated) {
        data = await this.client.send(
          new ListReusableDelegationSetsCommand({
            MaxItems: "100",
            Marker: data.NextMarker,
          })
        );
        delegationsets = delegationsets.concat(data.DelegationSets);
      }
    } catch (err) {
      console.error("Error", err);
    }
    return delegationsets;
  }

  async getReusableDelegationSet(id) {
    this.setParams();
    this.setupClient();
    let delegationset;
    try {
      let data = await this.client.send(
        new GetReusableDelegationSetCommand({
          Id: id,
        })
      );
      delegationset = data.DelegationSet;
    } catch (err) {
      console.error("Error", err);
    }
    return delegationset;
  }

  async getReusableDelegationSetLimit(id) {
    this.setParams();
    this.setupClient();
    let limit = {};
    try {
      let data = await this.client.send(
        new GetReusableDelegationSetLimitCommand({
          DelegationSetId: id,
          Type: "MAX_ZONES_BY_REUSABLE_DELEGATION_SET",
        })
      );
      limit = data;
    } catch (err) {
      console.error("Error", err);
    }
    return limit;
  }

  async createReusableDelegationSetCommand(caller_reference, hostedzone_id) {
    this.setParams();
    this.setupClient();
    let delegationset;
    try {
      let data = await this.client.send(
        new CreateReusableDelegationSetCommand({
          CallerReference: caller_reference,
          ...(hostedzone_id && { HostedZoneId: hostedzone_id }),
        })
      );
      delegationset = data;
    } catch (err) {
      console.error("Error", err);
    }
    return delegationset;
  }

  async deleteReusableDelegationSet(id) {
    this.setParams();
    this.setupClient();
    let result = {};
    try {
      let data = await this.client.send(
        new DeleteReusableDelegationSetCommand({
          Id: id,
        })
      );
      result = data;
    } catch (err) {
      console.error("Error", err);
    }
    result.Status = "SUBMITTED";
    result.Message = "Delegation set deletion has been submitted";
    return result;
  }

  async getHostedZones() {
    this.setParams();
    this.setupClient();
    let hostedzones = [];
    try {
      let data = await this.client.send(
        new ListHostedZonesCommand({
          MaxItems: "100",
        })
      );
      hostedzones = data.HostedZones;
      while (data.IsTruncated) {
        data = await this.client.send(
          new ListHostedZonesCommand({
            MaxItems: "100",
            Marker: data.NextMarker,
          })
        );
        hostedzones = hostedzones.concat(data.HostedZones);
      }
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzones;
  }

  async createHostedZone(
    name,
    delegationset_id,
    is_private_zone = false,
    vpc,
    caller_reference,
    comment
  ) {
    this.setParams();
    this.setupClient();
    let hostedzone = [];
    let hostedzone_config = {};
    if (comment) {
      hostedzone_config.Comment = comment;
    }
    if (is_private_zone) {
      hostedzone_config.PrivateZone = is_private_zone;
    }

    try {
      let data = await this.client.send(
        new CreateHostedZoneCommand({
          Name: name,
          CallerReference: caller_reference
            ? caller_reference
            : await this.generateCallerReference(),
          ...(is_private_zone && { VPC: vpc }),
          ...((is_private_zone || comment) && {
            HostedZoneConfig: hostedzone_config,
          }),
          ...(delegationset_id && { DelegationSetId: delegationset_id }),
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzone;
  }

  async updateHostedZone(id, comment) {
    this.setParams();
    this.setupClient();
    let hostedzone = [];
    try {
      let data = await this.client.send(
        new UpdateHostedZoneCommentCommand({
          Id: id,
          Comment: comment,
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzone;
  }

  async deleteHostedZone(id) {
    this.setParams();
    this.setupClient();
    let hostedzone_change_info = [];
    try {
      let data = await this.client.send(
        new DeleteHostedZoneCommand({
          Id: id,
        })
      );
      hostedzone_change_info = data.ChangeInfo;
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzone_change_info;
  }
  async getResourceRecordSets(id) {
    this.setParams();
    this.setupClient();
    let recordsets = [];
    try {
      let data = await this.client.send(
        new ListResourceRecordSetsCommand({
          HostedZoneId: id,
          MaxItems: "100",
        })
      );
      recordsets = data.ResourceRecordSets;
      while (data.IsTruncated) {
        data = await this.client.send(
          new ListResourceRecordSetsCommand({
            HostedZoneId: id,
            MaxItems: "100",
            StartRecordName: data.NextRecordName,
            StartRecordType: data.NextRecordType,
          })
        );
        recordsets = recordsets.concat(data.ResourceRecordSets);
      }
    } catch (err) {
      console.error("Error", err);
    }
    return recordsets;
  }

  async createRecordSet(id, name, type, ttl, values) {
    this.setParams();
    this.setupClient();
    let recordsets = [];
    try {
      let data = await this.client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: id,
          ChangeBatch: {
            Changes: [
              {
                Action: "UPSERT",
                ResourceRecordSet: {
                  Name: name,
                  Type: type,
                  TTL: ttl,
                  ResourceRecords: values,
                },
              },
            ],
          },
        })
      );
      recordsets = data.ResourceRecordSets;
    } catch (err) {
      console.error("Error", err);
    }
    return recordsets;
  }

  async deleteRecordSet(id, name, type, ttl, values) {
    this.setParams();
    this.setupClient();
    let recordsets = [];
    try {
      let data = await this.client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: id,
          ChangeBatch: {
            Changes: [
              {
                Action: "DELETE",
                ResourceRecordSet: {
                  Name: name,
                  Type: type,
                  TTL: ttl,
                  ResourceRecords: values,
                },
              },
            ],
          },
        })
      );
      recordsets = data.ResourceRecordSets;
    } catch (err) {
      console.error("Error", err);
    }
    return recordsets;
  }

  async updateRecordSets(hostedzone_id, recordset, comment) {
    this.setParams();
    this.setupClient();
    let changeInfo;
    let changes = [];

    // check if the recordset is an array or not
    if (Array.isArray(recordset)) {
      recordset.forEach((record) => {
        let resource_records = [];
        let { name, type, ttl, values } = record;
        if (Array.isArray(values)) {
          values.forEach((value) => {
            resource_records.push({ Value: value });
          });
        } else {
          resource_records.push({ Value: values });
        }
        changes.push({
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: name,
            Type: type,
            TTL: ttl,
            ResourceRecords: resource_records,
          },
        });
      });
    } else {
      let resource_records = [];
      let { name, type, ttl, values } = recordset;
      if (Array.isArray(values)) {
        values.forEach((value) => {
          resource_records.push({ Value: value });
        });
      } else {
        resource_records.push({ Value: values });
      }
      changes.push({
        Action: "UPSERT",
        ResourceRecordSet: {
          Name: name,
          Type: type,
          TTL: ttl,
          ResourceRecords: resource_records,
        },
      });
    }

    try {
      let data = await this.client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: hostedzone_id,
          ChangeBatch: {
            Changes: changes,
            ...(comment && { Comment: comment }),
          },
        })
      );
      changeInfo = data.ChangeInfo;
    } catch (err) {
      console.error("Error", err);
    }
    return changeInfo;
  }

  // get DNSSEC
  async getDNSSEC(hostedzone_id) {
    this.setParams();
    this.setupClient();
    let dnssec = [];
    try {
      let data = await this.client.send(
        new GetDNSSECCommand({
          HostedZoneId: hostedzone_id,
        })
      );
      dnssec = data;
    } catch (err) {
      console.error("Error", err);
    }
    return dnssec;
  }

  // enable DNSSEC for a hosted zone
  async enableDNSSEC(hostedzone_id) {
    this.setParams();
    this.setupClient();
    let hostedzone = [];
    try {
      let data = await this.client.send(
        new EnableHostedZoneDNSSECCommand({
          HostedZoneId: hostedzone_id,
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzone;
  }

  // disable DNSSEC for a hosted zone
  async disableDNSSEC(hostedzone_id) {
    this.setParams();
    this.setupClient();
    let hostedzone = [];
    try {
      let data = await this.client.send(
        new DisableHostedZoneDNSSECCommand({
          HostedZoneId: hostedzone_id,
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.error("Error", err);
    }
    return hostedzone;
  }

  /**
   * Create Key Signing Key (KSK) for a hosted zone
   * @function createKeySigningKey
   * @param {string} caller_reference - Caller reference for the request
   * @param {string} hostedzone_id - Hosted zone ID
   * @param {string} keymanagement_service_arn - Key Management Service (KMS) ARN
   * @param {string} name - Name of the key signing key
   * @param {string} status - Status of the key signing key
   * @returns {object} - Returns the Obbject with ChangeInfo, KeySigningKey, and Location
   *
   */
  async createKeySigningKey(
    caller_reference,
    hostedzone_id,
    keymanagement_service_arn,
    name,
    status
  ) {
    this.setParams();
    this.setupClient();
    let response;
    try {
      let data = await this.client.send(
        new CreateKeySigningKeyCommand({
          CallerReference: caller_reference
            ? caller_reference
            : await this.generateCallerReference(),
          HostedZoneId: hostedzone_id,
          KeyManagementServiceArn: keymanagement_service_arn,
          Name: name,
          Status: status,
        })
      );
      response = data;
    } catch (err) {
      console.error("Error", err);
    }
    return response;
  }

  /**
   * Delete Key Signing Key (KSK) for a hosted zone
   * @function deleteKeySigningKey
   * @param {string} hostedzone_id - Hosted zone ID
   * @param {string} key_signing_key_id - Key Signing Key ID
   * @returns {object} - Returns the Object with ChangeInfo, KeySigningKey, and Location
   * @example
   * let hostedzone_id = "Z1H1FL5HABSF5";
   * let key_signing_key_id = "Z1H1FL5HABSF5";
   * let response = await route53.deleteKeySigningKey(hostedzone_id, key_signing_key_id);
   * console.log(response);
   * // {
   * //   ChangeInfo: {
   * //     Id: '/change/C1H1FL5HABSF5',
   * //     Status: 'PENDING',
   * //     SubmittedAt: 2021-05-18T15:00:00.000Z
   * //   },
   * //   KeySigningKey: {
   * //     CallerReference: '2021-05-18T15:00:00.000Z',
   * //     CreationTime: 2021-05-18T15:00:00.000Z,
   * //     HostedZoneId: 'Z1H1FL5HABSF5',
   * //     Id: 'Z1H1FL5HABSF5',
   * //     KeyManagementServiceArn: 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
   * //     Name: 'example.com.',
   * //     Status: 'ACTIVE'
   * //   },
   * //   Location: '/2020-05-18/keysigningkey/Z1H1FL5HABSF5'
   * // }
   */
  async deleteKeySigningKey(hostedzone_id, key_signing_key_id) {
    this.setParams();
    this.setupClient();
    let response;
    try {
      let data = await this.client.send(
        new DeleteKeySigningKeyCommand({
          HostedZoneId: hostedzone_id,
          KeySigningKeyId: key_signing_key_id,
        })
      );
      response = data;
    } catch (err) {
      console.error("Error", err);
    }
    return response;
  }

  /**
   * Activate Key Signing Key (KSK) for a hosted zone
   * @function activateKeySigningKey
   * @param {string} hostedzone_id - Hosted zone ID
   * @param {string} key_signing_key_id - Key Signing Key ID
   * @returns {object} - Returns the Object with ChangeInfo, KeySigningKey, and Location
   * @example
   * let hostedzone_id = "Z1H1FL5HABSF5";
   * let key_signing_key_id = "Z1H1FL5HABSF5";
   * let response = await route53.activateKeySigningKey(hostedzone_id, key_signing_key_id);
   * console.log(response);
   * // {
   * //   ChangeInfo: {
   * //     Id: '/change/C1H1FL5HABSF5',
   * //     Status: 'PENDING',
   * //     SubmittedAt: 2021-05-18T15:00:00.000Z
   * //   },
   * //   KeySigningKey: {
   * //     CallerReference: '2021-05-18T15:00:00.000Z',
   * //     CreationTime: 2021-05-18T15:00:00.000Z,
   * //     HostedZoneId: 'Z1H1FL5HABSF5',
   * //     Id: 'Z1H1FL5HABSF5',
   * //     KeyManagementServiceArn: 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
   * //     Name: 'example.com.',
   * //     Status: 'ACTIVE'
   * //   },
   * //   Location: '/2020-05-18/keysigningkey/Z1H1FL5HABSF5'
   * // }
   *
   */
  // async activateKeySigningKey(hostedzone_id, key_signing_key_id) {
  //   this.setParams();
  //   this.setupClient();
  //   let response;
  //   try {
  //     let data = await this.client.send(
  //       new ActivateKeySigningKeyCommand({
  //         HostedZoneId: hostedzone_id,
  //         KeySigningKeyId: key_signing_key_id,
  //       })
  //     );
  //     response = data;
  //   } catch (err) {
  //     console.error("Error", err);
  //   }
  //   return response;
  // }

  /**
   * Deactivate Key Signing Key (KSK) for a hosted zone
   * @function deactivateKeySigningKey
   * @param {string} hostedzone_id - Hosted zone ID
   * @param {string} key_signing_key_id - Key Signing Key ID
   * @returns {object} - Returns the Object with ChangeInfo, KeySigningKey, and Location
   * @example
   * let hostedzone_id = "Z1H1FL5HABSF5";
   * let key_signing_key_id = "Z1H1FL5HABSF5";
   * let response = await route53.deactivateKeySigningKey(hostedzone_id, key_signing_key_id);
   * console.log(response);
   * // {
   * //   ChangeInfo: {
   * //     Id: '/change/C1H1FL5HABSF5',
   * //     Status: 'PENDING',
   * //     SubmittedAt: 2021-05-18T15:00:00.000Z
   * //   },
   * //   KeySigningKey: {
   * //     CallerReference: '2021-05-18T15:00:00.000Z',
   * //     CreationTime: 2021-05-18T15:00:00.000Z,
   * //     HostedZoneId: 'Z1H1FL5HABSF5',
   * //     Id: 'Z1H1FL5HABSF5',
   * //     KeyManagementServiceArn: 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
   * //     Name: 'example.com.',
   * //     Status: 'INACTIVE'
   * //   },
   * //   Location: '/2020-05-18/keysigningkey/Z1H1FL5HABSF5'
   * // }
   *
   */
  // async deactivateKeySigningKey(hostedzone_id, key_signing_key_id) {
  //   this.setParams();
  //   this.setupClient();
  //   let response;
  //   try {
  //     let data = await this.client.send(
  //       new DeactivateKeySigningKeyCommand({
  //         HostedZoneId: hostedzone_id,
  //         KeySigningKeyId: key_signing_key_id,
  //       })
  //     );
  //     response = data;
  //   } catch (err) {
  //     console.error("Error", err);
  //   }
  //   return response;
  // }
}

module.exports = Route53API;
