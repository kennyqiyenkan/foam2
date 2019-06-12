/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'DAOMonthlyReduceManager',
  extends: 'foam.nanos.analytics.DAOReduceManager',

  javaImports: [
    'java.util.Calendar',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'getStartDate',
      type: 'Date',
      args: [
        {
          class: 'Date',
          name: 'date'
        }
      ],
      javaCode: `
Calendar calendar = Calendar.getInstance();
calendar.setTime(date);

calendar.set(Calendar.DATE, 1);
calendar.set(Calendar.MILLISECOND, 0);
calendar.set(Calendar.SECOND, 0);
calendar.set(Calendar.MINUTE, 0);
calendar.set(Calendar.HOUR_OF_DAY, 0);

return calendar.getTime();
      `
    },
    {
      name: 'getEndDate',
      type: 'Date',
      args: [
        {
          class: 'Date',
          name: 'date'
        }
      ],
      javaCode: `
Calendar calendar = Calendar.getInstance();
calendar.setTime(date);

calendar.set(Calendar.DATE, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
calendar.set(Calendar.MILLISECOND, 999);
calendar.set(Calendar.SECOND, 59);
calendar.set(Calendar.MINUTE, 59);
calendar.set(Calendar.HOUR_OF_DAY, 23);

return calendar.getTime();
      `
    },
    {
      name: 'doReduce',
      javaCode: `
foam.core.X x = getX();

foam.mlang.sink.Max lastReduceSink = (foam.mlang.sink.Max) getDestDAO()
  .select(MAX(Candlestick.OPEN_TIME));
Date lastReduce = (Date) lastReduceSink.getValue();

foam.mlang.sink.GroupBy dataToReduce = (foam.mlang.sink.GroupBy) getSourceDAO()
  .where(GTE(Candlestick.OPEN_TIME, lastReduce))
  .select(GROUP_BY(Candlestick.KEY, new foam.dao.ArraySink.Builder(x).build()));

for ( Object key : dataToReduce.getGroups().keySet() ) {
  java.util.Map<Date, Candlestick> reducedData = new java.util.HashMap<Date, Candlestick>();
  for ( Object o : ((foam.dao.ArraySink) dataToReduce.getGroups().get(key)).getArray() ) {
    Candlestick c = (Candlestick) o;
    Date startOfMonth = getStartDate(c.getCloseTime());
    Date endOfMonth = getEndDate(c.getCloseTime());
    if ( ! reducedData.containsKey(endOfMonth) ) {
      reducedData.put(endOfMonth, new Candlestick.Builder(x)
        .setOpenTime(startOfMonth)
        .setCloseTime(endOfMonth)
        .setKey(key)
        .build());
    }
    reducedData.get(endOfMonth).reduce(c);
  }
  for ( Candlestick c : reducedData.values() ) {
    getDestDAO().put(c);
  }
}
      `
    }
  ]
});
