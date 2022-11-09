module.exports = {
  Query: {
    hostedzones: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getHostedZones(context),
    hostedzone_recordsets: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.getResourceRecordSets(id, context),
    resusable_delegation_sets: async (_, {}, { dataSources, context }) =>
      dataSources.route53API.getReusableDelegationSets(context),
    resusable_delegation_set: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.getReusableDelegationSet(id, context),
    resusable_delegation_set_limit: async (
      _,
      { id },
      { dataSources, context }
    ) => dataSources.route53API.getReusableDelegationSetLimit(id, context),
    dnssec: async (_, { hostedzone_id }, { dataSources, context }) =>
      dataSources.route53API.getDNSSEC(hostedzone_id, context)
  },

  Mutation: {
    insert_hostedzone: async (
      _,
      {
        name,
        delegationset_id,
        is_private_zone,
        vpc,
        caller_reference,
        comment,
      },
      { dataSources, context }
    ) =>
      dataSources.route53API.createHostedZone(
        name,
        delegationset_id,
        is_private_zone,
        vpc,
        caller_reference,
        comment,
        context
      ),
    update_hostedzone: async (_, { id, comment }, { dataSources, context }) =>
      dataSources.route53API.updateHostedZone(id, comment, context),
    delete_hostedzone: async (_, { id }, { dataSources, context }) =>
      dataSources.route53API.deleteHostedZone(id, context),

    insert_reusable_delegation_set: async (
      _,
      { caller_reference, hostedzone_id },
      { dataSources, context }
    ) =>
      dataSources.route53API.createReusableDelegationSet(
        caller_reference,
        hostedzone_id,
        context
      ),
    delete_reusable_delegation_set: async (
      _,
      { id },
      { dataSources, context }
    ) => dataSources.route53API.deleteReusableDelegationSet(id, context),
    update_recordsets: async (_, { hostedzone_id, RecordSet, comment }, { dataSources, context }) =>
      dataSources.route53API.updateRecordSets(hostedzone_id, RecordSet, comment, context),
    insert_recordset: async (_, { RecordSet }, { dataSources, context }) =>
      dataSources.route53API.createRecordSet(RecordSet, context),
  },
};
