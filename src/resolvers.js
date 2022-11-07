module.exports = {
  Query: {
    hostedzones: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getHostedZones(context),
    hostedzone_recordsets: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.getResourceRecordSets(id, context),
  },
};
