/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'AggregatedCandlestickDAOChartView',
  extends: 'foam.u2.View',

  documentation: `
    A view that would generate a chart using chartjs and a supplied CandlestickDAO.
  `,

  implements: [
    'foam.mlang.Expressions',
    'org.chartjs.CandlestickChartInterface'
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.dao.EasyDAO',
    'org.chartjs.CandlestickDAOChartView'
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
    function initE() {
      var self = this;
      this.onDetach(this.data$.sub(function() {
        self.dataUpdate();
      }));
      this.dataUpdate();

      this.add(this.CandlestickDAOChartView.create({
        data$: this.aggregatedDAO$,
        config$: this.config$,
        customDatasetStyling$: this.customDatasetStyling$,
        keyExpr$: this.keyExpr$,
        xExpr$: this.xExpr$,
        yExpr$: this.yExpr$
      }));
    },
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.data ) return;
        var aggregate = this.EasyDAO.create({
          of: 'foam.nanos.analytics.Candlestick',
          daoType: 'ARRAY'
        });
        var self = this;
        var dataToCollect = this.data.length;
        this.data.forEach(function(dao) {
          dao.select().then(function(sink) {
            sink.array.forEach(function(candle) {
              aggregate.put(candle);
            });
            dataToCollect--;
            if ( dataToCollect <= 0 ) {
              self.aggregatedDAO = aggregate;
            }
          }).catch(function(err) {
            console.error(err);
          });
        });
      }
    }
  ]
});
