const { RESTDataSource } = require("apollo-datasource-rest");

class Route53API extends RESTDataSource {
  constructor() {
    super();
  }

  async getHostedZones() {
    // user route53 sdk to get hosted zones
    // return hosted zones
    return [];
  }
}

module.exports = Route53API;
