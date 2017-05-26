package foam.dao;

import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class OrderedDAO
  extends ProxyDAO
{
  private foam.mlang.order.Comparator order_;

  public OrderedDAO setOrder(foam.mlang.order.Comparator order) {
    order_ = order;
    return this;
  }

  public Sink select_(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(s, skip, limit, order_ == null ? order : order_, predicate);
  }

  public Sink select(Sink sink) {
    return this.select_(sink, 0, Integer.MAX_VALUE, null, null);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit, order_ == null ? order : order_, predicate);
  }
}
