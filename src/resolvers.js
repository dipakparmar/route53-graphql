module.exports = {
  Query: {
    hostedzones: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getHostedZones(context),
    hostedzone_recordsets: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.getResourceRecordSets(id, context),

    resusable_delegation_sets: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getReusableDelegationSets(context),
    resusable_delegation_set_limit: async (
      _,
      { id },
      { dataSources, context }
    ) => dataSources.route53API.getReusableDelegationSetLimit(id, context),
  },

  Mutation: {
    insert_hostedzone: async (_, { name }, { dataSources, context }) =>
      dataSources.route53API.createHostedZone(name, context),
    update_hostedzone: async (_, { id, name }, { dataSources, context }) =>
      dataSources.route53API.updateHostedZone(id, name, context),
    delete_hostedzone: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.deleteHostedZone(id, context),
    update_recordset: async (_, { RecordSet }, { dataSources, context }) =>
      dataSources.route53API.updateResourceRecordSet(RecordSet, context),
    insert_recordset: async (_, { RecordSet }, { dataSources, context }) =>
      dataSources.route53API.createResourceRecordSet(RecordSet, context),
  },
};
