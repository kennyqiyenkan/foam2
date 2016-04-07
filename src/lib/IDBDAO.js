/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


foam.CLASS({
  package: 'foam.dao',
  name: 'IDBInternalException',
  extends: 'foam.dao.InternalException',

  // TODO: Which errors are internal (system problems) vs. external
  // (i.e. invalid data for clone, but you can try again with different data)
  properties: [
    'id',
    'error',
    {
      name: 'message',
      expression: function(id, error) {
        return "IndexedDB Error for " + id +
          ( error ? ": " + error.toString() : "" );
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'IDBDAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.FlowControl',
    'foam.dao.ArraySink',
    'foam.dao.IDBInternalException',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Eq',
  ],

  imports: [
    'async',
  ],

  constants: {
    /** Global cache of the current transaction reference. Only element 0 is used. */
    __TXN__: [],
  },

  properties: [
    {
      name:  'of',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      expression: function() {
        return this.of.id;
      }
    },
    {
      name: 'indicies',
      factory: function() { return []; }
    },
    {
      /** The promise that holds the open DB. Call this.withDB.then(function(db) { ... }); */
      name: 'withDB',
      factory: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
          var indexedDB = window.indexedDB ||
            window.webkitIndexedDB         ||
            window.mozIndexedDB;

          var request = indexedDB.open("FOAM:" + self.name, 1);

          request.onupgradeneeded = function(e) {
            var store = e.target.result.createObjectStore(self.name);
            for ( var i = 0; i < self.indicies.length; i++ ) {
              store.createIndex(self.indicies[i][0], self.indicies[i][0], { unique: self.indicies[i][1] });
            }
          }

          request.onsuccess = function(e) {
            resolve(e.target.result);
          }

          request.onerror = function (e) {
            reject(self.IDBInternalException.create({ id: 'open', error: e }));
          };
        });
      }
    },
  ],

  methods: [

    function deserialize(json) {
      return foam.json.parse(foam.json.parseString(json)); //TODO: serialization
    },

    function serialize(obj) {
      return foam.json.stringify(obj); //TODO: serialization
    },

    function withStore(mode, fn) {
      if ( mode !== 'readwrite' ) return this.withStore_(mode, fn);

      var self = this;

      if ( ! this.q_ ) {
        var q = [fn];
        this.q_ = q;
        this.async(function() {
          self.withStore_(mode, function(store) {
            // console.log('q length: ', q.length);
            if ( self.q_ == q ) self.q_ = undefined;
            for ( var i = 0 ; i < q.length ; i++ ) q[i](store);
          });
        })();
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    function withStore_(mode, fn) {
      var self = this;
      if ( self.__TXN__[0] ) {
        try {
          fn.call(self, self.__TXN__[0]);
          return;
        } catch (x) {
          self.__TXN__[0] = undefined;
        }
      }
      self.withDB.then(function (db) {
        var tx = db.transaction([self.name], mode);
        var os = tx.objectStore(self.name);
        self.__TXN__[0] = os;
        fn.call(self, os);
      });
    },

    function put(value) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var request = store.put(self.serialize(value), value.id);
          request.transaction.addEventListener(
            'complete',
            function(e) {
              self.pub('on','put', value);
              resolve(value);
            });
          request.transaction.addEventListener(
            'error',
            function(e) {
              reject(self.IDBInternalException.create({ id: value.id, error: e }));
            });
        });
      });
    },

    function find(key) {
      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readonly", function(store) {
          var request = store.get(key);
          request.transaction.addEventListener(
            'complete',
            function() {
              if (!request.result) {
                reject(self.ObjectNotFoundException.create({ id: key }));
                return;
              }
              var result = self.deserialize(request.result);
              resolve(result);
            });
          request.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function remove(obj) {
      var self = this;
      var key = obj.id != undefined ? obj.id : obj;
      return new Promise(function(resolve, reject) {
        self.withStore("readwrite", function(store) {
          var getRequest = store.get(key);
          getRequest.onsuccess = function(e) {
            if (!getRequest.result) {
              // not found? as good as removed!
              self.pub('on','remove', obj);
              resolve();
              return;
            }
            var data = self.deserialize(getRequest.result);
            var delRequest = store.delete(key);
            delRequest.transaction.addEventListener('complete', function(e) {
              self.pub('on','remove', data);
              resolve();
            });

            delRequest.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: key, error: e }));
            };
          };
          getRequest.onerror = function(e) {
            reject(self.IDBInternalException.create({ id: key, error: e }));
          };
        });
      });
    },

    function removeAll(skip, limit, order, predicate) {
      var query = predicate || this.True.create();

      var self = this;

      // If the caller doesn't care to see the objects as they get removed,
      // then just nuke them in one go.
      if ( ! predicate && ! self.hasListeners('on', 'remove') ) {
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var req = store.clear();
            req.onsuccess = function() {
              resolve();
            };
            req.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
            };
          });
        });
      } else {
        // send items to the sink and remove one by one
        return new Promise(function(resolve, reject) {
          self.withStore('readwrite', function(store) {
            var request = store.openCursor();
            request.onsuccess = function(e) {
              var cursor = e.target.result;
              if (cursor) {
                var value = self.deserialize(cursor.value);
                if (query.f(value)) {
                  var deleteReq = cursor.delete();
                  deleteReq.transaction.addEventListener(
                    'complete',
                    function() {
                      self.pub('on','remove', value);
                    });
                  deleteReq.onerror = function(e) {
                  };
                }
                cursor.continue();
              }
            };
            request.transaction.oncomplete = function() {
              resolve();
            };
            request.onerror = function(e) {
              reject(self.IDBInternalException.create({ id: 'remove_all', error: e }));
            };
          });
        });
      }
    },

    function select(sink, skip, limit, order, predicate) {
      var resultSink = sink || this.ArraySink.create();
      sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

      var fc = this.FlowControl.create();
      var self = this;

      return new Promise(function(resolve, reject) {
        self.withStore("readonly", function(store) {
          if ( predicate && this.Eq.isInstance(predicate) && store.indexNames.contains(predicate.arg1.name) ) {
            var request = store.index(predicate.arg1.name).openCursor(IDBKeyRange.only(predicate.arg2.f()));
          } else {
            var request = store.openCursor();
          }
          request.onsuccess = function(e) {
            var cursor = e.target.result;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              reject(fc.errorEvt);
              return;
            }

            if ( ! cursor || fc.stopped ) {
              sink.eof && sink.eof();
              resolve(resultSink);
              return;
            }

            var value = self.deserialize(cursor.value);
            sink.put(value, null, fc);
            cursor.continue();
          };
          request.onerror = function(e) {
            sink.error && sink.error(e);
            reject(self.IDBInternalException.create({ id: 'select', error: e }));
          };
        });
      });
    },

    function addIndex(prop) {
      this.indicies.push([prop.name, false]);
      return this;
    }
  ],

});
