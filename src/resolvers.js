module.exports = {
  Query: {
    hostedzones: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getHostedZones(context),
    hostedzone_recordsets: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.getResourceRecordSets(id, context),
  },

  Mutation: {
    insert_hostedzone: async (_, { name }, { dataSources, context }) =>
      dataSources.route53API.createHostedZone(name, context),
    update_hostedzone: async (_, { id, name }, { dataSources, context }) =>
      dataSources.route53API.updateHostedZone(id, name, context),
    delete_hostedzone: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.deleteHostedZone(id, context),
  },
};
