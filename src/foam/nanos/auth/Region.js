/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Region',

  documentation: 'Region (province/state) information.',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      documentation: 'Category of region. Eg: State or Union Territory etc.'
      name: 'category'
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    }
  ]
});
