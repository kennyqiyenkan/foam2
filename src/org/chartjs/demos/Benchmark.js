/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'Benchmark',

  requires: [
    'foam.dao.MDAO',
    'foam.nanos.analytics.Candlestick'
  ],

  properties :[
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.MDAO.create({ of: this.Candlestick });
      },
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'org.chartjs.CandlestickDAOChartView',
            /*
            config: {
              type: 'bar',
              options: {
                scales: {
                  xAxes: [{
                    type: 'time',
                    distribution: 'linear'
                  }]
                }
              }
            },
            */
            customDatasetStyling: {
              TSLA: {
                steppedLine: true,
                borderColor: [
                  'rgba(255, 99, 132, 1)'
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                label: 'Red Team (TSLA)'
              },
              NFLX: {
                borderColor: [
                  'rgba(54, 162, 235, 1)'
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                label: 'Blue Team (NFLX)'
              }
            }
          },
          {
            class: 'foam.u2.TableView'
          }
        ]
      }
    },
    {
      class: 'List',
      name: 'daoList',
      factory: function() {
        return [];
      },
      view: {
        class: 'org.chartjs.AggregatedCandlestickDAOChartView',
        customDatasetStyling: {
          TSLA: {
            steppedLine: true,
            borderColor: [
              'rgba(132, 99, 132, 1)'
            ],
            backgroundColor: 'rgba(132, 99, 132, 0.3)',
            label: 'Red Team (TSLA)'
          },
          NFLX: {
            borderColor: [
              'rgba(54, 50, 235, 1)'
            ],
            backgroundColor: 'rgba(54, 50, 235, 0.3)',
            label: 'Blue Team (NFLX)'
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'generateData',
      code: function() {
        var self = this;
        var day = 24 * 60 * 60 * 1000;
        var year = 365 * day;
        var startTime = 0;
        var endTime = year;
        var step = day;
        var data = [];
        var curValue = 1000;
        var curValue2 = 1000;

        var dao1 = this.MDAO.create({ of: this.Candlestick });
        var data1 = [];
        var dao2 = this.MDAO.create({ of: this.Candlestick });
        var data2 = [];

        for ( var i = startTime ; i < endTime ; i += step ) {
          var value1 = {
            key: 'NFLX',
            total: curValue,
            count: 1,
            openTime: new Date(i),
            closeTime: new Date(i+step)
          };
          var value2 = {
            key: 'TSLA',
            total: curValue2,
            count: 1,
            openTime: new Date(i),
            closeTime: new Date(i+step)
          };
          data.push(value1);
          data.push(value2);

          data1.push(value1);
          data2.push(value2);

          curValue += Math.random()*5 - 2.5;
          curValue2 += Math.random()*5 - 2.5;
        }

        console.log(data.length);
        console.log(data1.length);
        console.log(data2.length);

        data.map(d => self.dao.put(foam.nanos.analytics.Candlestick.create(d)));
        data1.map(d => dao1.put(foam.nanos.analytics.Candlestick.create(d)));
        data2.map(d => dao2.put(foam.nanos.analytics.Candlestick.create(d)));

        self.daoList = [dao1, dao2];
      }
    }
  ]
});
