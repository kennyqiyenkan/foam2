/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'ToggleSwitch',
  extends: 'foam.u2.View',

  documentation: 'Toggle Switch View.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: inline-block;
        }
        ^ .toggleswitch {
          position: relative;
          width: 40px;
          -webkit-user-select:none;
          -moz-user-select:none;
          -ms-user-select: none;
        }
        ^ .toggleswitch-checkbox {
          display: none;
        }
        ^ .toggleswitch-label {
          display: block;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid #FFFFFF;
          border-radius: 50px;
        }
        ^ .toggleswitch-inner {
          display: block;
          width: 200%;
          margin-left: -100%;
          transition: margin 0.2s ease-in 0s;
        }
        ^ .toggleswitch-inner:before, ^ .toggleswitch-inner:after {
          display: block;
          float: left;
          width: 50%;
          height: 20px;
          padding: 0;
          line-height: 20px;
          font-size: 25px;
          color: white;
          box-sizing: border-box;
        }
        ^ .toggleswitch-inner:before {
          content: "";
          padding-left: 14px;
          background-color: #59A5D5;
          color: #59A5D5;
        }
        ^ .toggleswitch-inner:after {
          content: "";
          padding-right: 14px;
          background-color: rgba(164, 179, 184, 0.5);
          color: #999999;
          text-align: right;
        }
        ^ .toggleswitch-switch {
          display: block;
          width: 12px;
          margin: 4px;
          background: #FFFFFF;
          position: absolute;
          top: 0;
          bottom: 0;
          right: 16px;
          border: 2px solid #FFFFFF;
          border-radius: 50px;
          transition: all 0.2s ease-in 0s;
        }
        ^ .toggleswitch-checkbox:checked + .toggleswitch-label .toggleswitch-inner {
          margin-left: 0;
        }
        ^ .toggleswitch-checkbox:checked + .toggleswitch-label .toggleswitch-switch {
          right: 0px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'showLabel',
      factory: function() { return !!this.label },
    },
    {
      class: 'String',
      name: 'label'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('div').addClass('toggleswitch')
          .start({class: 'foam.u2.CheckBox', data$: this.data$, label: this.label, showLabel: this.showLabel}).addClass('toggleswitch-checkbox')
            .attrs({ name: 'toggleswitch' })
            .setID(id = 'mytoggleswitch')
          .end()
          .start('label').addClass('toggleswitch-label')
            .attrs({ for: 'mytoggleswitch' })
            .start('span').addClass('toggleswitch-inner').end()
            .start('span').addClass('toggleswitch-switch').end()
          .end()
        .end();
    }
  ]
});
