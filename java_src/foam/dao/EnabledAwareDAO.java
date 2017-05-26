/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class EnabledAwareDAO
  extends ProxyDAO
{
  public static final Predicate PREDICATE = foam.mlang.MLang.EQ(EnabledAware.ENABLED, true);

  public Sink select_(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(s, skip, limit, order, PREDICATE);
  }

  public Sink select(Sink sink) {
    return this.select_(sink, 0, Integer.MAX_VALUE, null, null);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit, order, PREDICATE);
  }
}
