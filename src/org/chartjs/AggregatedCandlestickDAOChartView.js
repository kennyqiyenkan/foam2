foam.CLASS({
  package: 'org.chartjs',
  name: 'AggregatedCandlestickDAOChartView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions',
    'org.chartjs.CandlestickChartInterface'
  ],

  requires: [
    'foam.dao.EasyDAO'
  ],

  properties: [
    {
      class: 'List',
      name: 'data',
      documentation: `
        The supplied array of CandlestickDAOs.
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'aggregatedDAO'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.data.forEach(function(dao) {
        var aggregate = this.EasyDAO.create({
          of: 'foam.nanos.analytics.Candlestick',
          daoType: 'ARRAY'
        });
      });
    }
  ]
});
