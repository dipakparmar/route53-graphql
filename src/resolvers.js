module.exports = {
  Query: {
    hostedzones: async (_,{}, { dataSources, context }) =>
      dataSources.route53API.getHostedZones(context),
  },
};
