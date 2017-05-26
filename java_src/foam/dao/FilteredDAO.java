package foam.dao;

import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class FilteredDAO
  extends ProxyDAO
{
  private Predicate predicate_;

  public FilteredDAO setPredicate(Predicate predicate) {
    predicate_ = predicate;
    return this;
  }

  private Predicate getPredicate(Predicate arg) {
    if ( arg != null ) return predicate_;

    return ((And) getX().create(And.class))
      .setArgs(new Predicate[] {
          predicate_,
          arg
        });
  }

  public Sink select_(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(s, skip, limit, order, getPredicate(predicate));
  }

  public Sink select(Sink sink) {
    return this.select_(sink, 0, Integer.MAX_VALUE, null, null);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit, order, getPredicate(predicate));
  }
}
