foam.INTERFACE({
  package: 'org.chartjs',
  name: 'CandlestickChartInterface',

  requires: [
    'foam.nanos.analytics.Candlestick'
  ],

  properties: [
    {
      class: 'Map',
      name: 'config',
      documentation: `
        The config map that is expected by chartjs. Structure and information can be found in chartjs.org's documentation.
      `,
      factory: function () {
        return {
          type: 'line',
          data: { datasets: [] },
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                distribution: 'linear'
              }]
            }
          }
        };
      }
    },
    {
      class: 'Map',
      name: 'customDatasetStyling',
      documentation: `
        Property map that would hold the customization for each key type in the candlestickDAO.
        1. Key must equal the candlestick's key.
        2. Value mapped with key must be a 1:1 mapping defined in chartjs.org's documentation.
      `
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'keyExpr',
      factory: function() { return this.Candlestick.KEY; }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'xExpr',
      factory: function() { return this.Candlestick.CLOSE_TIME; }
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'yExpr',
      factory: function() { return this.Candlestick.AVERAGE; }
    }
  ]
});
