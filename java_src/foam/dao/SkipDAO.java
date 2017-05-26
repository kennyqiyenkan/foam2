package foam.dao;

import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class SkipDAO
  extends ProxyDAO
{
  private int skip_;

  public SkipDAO setSkip(int skip) {
    skip_ = skip;
    return this;
  }

  public Sink select_(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(s, skip_, limit, order, predicate);
  }

  public Sink select(Sink sink) {
    return this.select_(sink, 0, Integer.MAX_VALUE, null, null);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip_, limit, order, predicate);
  }
}
