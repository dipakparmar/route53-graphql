module.exports = {
  Query: {
    hostedzones: async (_,{}, { dataSources }) => 
      dataSources.route53API.getHostedZones(),
    },
};
