/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.LiteralIC;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq1;

public class AfterGteParser extends foam.lib.parse.ProxyParser {

  public AfterGteParser(Parser valueParser) {
    setDelegate(new Seq1(1,
                        new Alt(new Literal(">="),
                                new LiteralIC("-after:")),
                        valueParser
                        ));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse( ps, x );
    if ( ps == null ) return ps;

    foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Gte();
    predicate.setArg1(( foam.mlang.Expr ) x.get( "arg1" ));

    predicate
      .setArg2(( ps.value() instanceof foam.mlang.Expr ) ? (foam.mlang.Expr) ps
          .value() : new foam.mlang.Constant(ps.value()));

    return ps.setValue(predicate);
  }
}
