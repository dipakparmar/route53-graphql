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
    });
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
            : "" + Date.now().toLocaleString(),
          ...(is_private_zone && { VPC: vpc }),
          ...((is_private_zone || comment) && {
            HostedZoneConfig: hostedzone_config,
          }),
          ...(delegationset_id && { DelegationSetId: delegationset_id }),
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
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
      console.log("Error", err);
    }
    return changeInfo;
  }
}

module.exports = Route53API;
