/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the RP.
 *
 * A subclass should override `fieldsInResumeToken` to add/modify which
 * fields are saved to and populated from a resume token in the resume
 * query parameter.
 */

define([
  'underscore',
  'models/reliers/base',
  'models/resume-token',
  'models/mixins/search-param',
  'lib/promise',
  'lib/constants'
], function (_, BaseRelier, ResumeToken, SearchParamMixin, p, Constants) {
  'use strict';

  var RELIER_FIELDS_IN_RESUME_TOKEN = ['campaign', 'entrypoint'];

  var Relier = BaseRelier.extend({
    defaults: {
      service: null,
      preVerifyToken: null,
      email: null,
      allowCachedCredentials: true,
      entrypoint: null,
      campaign: null
    },

    initialize: function (options) {
      options = options || {};

      this.window = options.window || window;
    },

    /**
     * Fetch hydrates the model. Returns a promise to allow
     * for an asynchronous load. Sub-classes that override
     * fetch should still call Relier's version before completing.
     *
     * e.g.
     *
     * fetch: function () {
     *   return Relier.prototype.fetch.call(this)
     *       .then(function () {
     *         // do overriding behavior here.
     *       });
     * }
     */
    fetch: function () {
      var self = this;
      return p()
        .then(function () {
          // parse the resume token before importing any other data.
          // query parameters and server provided data take precendence.
          self._parseResumeToken();

          self.importSearchParam('service');
          self.importSearchParam('preVerifyToken');
          self.importSearchParam('uid');
          self.importSearchParam('setting');
          self.importSearchParam('entrypoint');
          self.importSearchParam('campaign');

          // A relier can indicate they do not want to allow
          // cached credentials if they set email === 'blank'
          if (self.getSearchParam('email') ===
              Constants.DISALLOW_CACHED_CREDENTIALS) {
            self.set('allowCachedCredentials', false);
          } else {
            self.importSearchParam('email');
          }
        });
    },

    /**
     * Check if the relier is Sync for Firefox Desktop
     */
    isSync: function () {
      return this.get('service') === Constants.FX_DESKTOP_SYNC;
    },

    /**
     * We should always fetch keys for sync.  If the user verifies in a
     * second tab on the same browser, the context will not be available,
     * but we will need to ship the keyFetchToken and unwrapBKey over to
     * the first tab.
     */
    wantsKeys: function () {
      return this.isSync();
    },

    /**
     * Check if the relier allows cached credentials. A relier
     * can set email=blank to indicate they do not.
     */
    allowCachedCredentials: function () {
      return this.get('allowCachedCredentials');
    },

    // override fieldsInResumeToken to add/change fields
    // that are saved to and populated from the resume token.
    fieldsInResumeToken: RELIER_FIELDS_IN_RESUME_TOKEN,
    pickResumeTokenInfo: function () {
      return this.pick(this.fieldsInResumeToken);
    },

    /**
     * Sets relier properties from the resume token value
     * @private
     */
    _parseResumeToken: function () {
      var resumeParam = this.getSearchParam('resume');
      var resumeToken = new ResumeToken(ResumeToken.parse(resumeParam));

      this.set(resumeToken.pick(this.fieldsInResumeToken));
    }
  });

  _.extend(Relier.prototype, SearchParamMixin);

  return Relier;
});
