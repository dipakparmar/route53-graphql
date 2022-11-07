const { RESTDataSource } = require("apollo-datasource-rest");
import {
  Route53Client,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand,
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

  async createHostedZone(name) {
    this.setParams();
    this.setupClient();
    let hostedzone = [];
    try {
      let data = await this.client.send(
        new CreateHostedZoneCommand({
          Name: name,
          CallerReference: "" + Date.now(),
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
    let hostedzone = [];
    try {
      let data = await this.client.send(
        new DeleteHostedZoneCommand({
          Id: id,
        })
      );
      hostedzone = data.HostedZone;
    } catch (err) {
      console.log("Error", err);
    }
    return hostedzone;
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

}

module.exports = Route53API;
