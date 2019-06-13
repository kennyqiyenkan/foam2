/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'org.chartjs',
  name: 'CandlestickDAOChartView',
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
    'org.chartjs.ChartCView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      documentation: `
        The supplied CandlestickDAO.
      `
    }
  ],

  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      this.dataUpdate();
      this.add(this.ChartCView.create({ config$: this.config$ }));
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.data ) return;
        var self = this;
        self.data
          .orderBy(this.xExpr)
          .select(this.GROUP_BY(this.keyExpr, this.PLOT(this.xExpr, this.yExpr)))
          .then(function(sink) {
            var config = foam.Object.clone(self.config);
            config.data = {
              datasets: Object.keys(sink.groups).map(key => {
                var data = {
                  label: key,
                  data: sink.groups[key].data.map(arr => ({ x: arr[0], y: arr[1] }))
                };
                var style = self.customDatasetStyling[key] || {};
                Object.keys(style).forEach(function(k) {
                  data[k] = style[k];
                });
                return data;
              })
            };
            self.config = config;
          });
      }
    }
  ]
});
