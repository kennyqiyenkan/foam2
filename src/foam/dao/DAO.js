/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAO',

  documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      args: [ 'obj' ]
    },
    {
      name: 'find',
      returns: 'Promise',
      args: [ 'id' ]
    },
    {
      name: 'select',
      returns: 'Promise',
      args: [ 'sink' ]
    },
    {
      name: 'select_',
      returns: 'Promise',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'removeAll',
      returns: '',
      args: [ 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'listen',
      returns: '',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      args: [ 'sink', 'skip', 'limit', 'order', 'predicate' ]
    },
    {
      name: 'where',
      returns: 'foam.dao.DAO',
      args: [ 'predicate' ]
    },
    {
      name: 'orderBy',
      returns: 'foam.dao.DAO',
      args: [ 'comparator' ]
    },
    {
      name: 'skip',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    },
    {
      name: 'limit',
      returns: 'foam.dao.DAO',
      args: [ 'count' ]
    }
  ]
});
