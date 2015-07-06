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
  'cocktail',
  'models/reliers/base',
  'models/mixins/resume-token',
  'models/mixins/search-param',
  'lib/promise',
  'lib/constants',
  'underscore'
], function (Cocktail, BaseRelier, ResumeTokenMixin, SearchParamMixin, p,
  Constants, _) {
  'use strict';

  var RELIER_FIELDS_IN_RESUME_TOKEN = ['campaign', 'entrypoint'];

  var Relier = BaseRelier.extend({
    defaults: {
      allowCachedCredentials: true,
      campaign: null,
      email: null,
      entrypoint: null,
      preVerifyToken: null,
      service: null,
      setting: null,
      uid: null,
      utm_campaign: null,
      utm_content: null,
      utm_medium: null,
      utm_source: null,
      utm_term: null
    },

    initialize: function (options) {
      options = options || {};

      this.window = options.window || window;
    },

    /**
     * Hydrate the model. Returns a promise to allow
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
     *
     * @method fetch
     */
    fetch: function () {
      var self = this;
      return p()
        .then(function () {
          // parse the resume token before importing any other data.
          // query parameters and server provided data override
          // resume provided data.
          self.populateFromStringifiedResumeToken(self.getSearchParam('resume'));

          // all default defined fields can be imported except
          // allowCachedCredentials which is set manually.
          var paramsToImport =
            _.without(Object.keys(self.defaults), 'allowCachedCredentials');

          paramsToImport.forEach(function (param) {
            // importSearchParam is called inside of a function instead of
            // using self.importSearchPram.bind(self) so that the index is not
            // passed as the modelName.
            self.importSearchParam(param);
          });

          // A relier can indicate they do not want to allow
          // cached credentials if they set email === 'blank'
          if (self.get('email') === Constants.DISALLOW_CACHED_CREDENTIALS) {
            self.unset('email');
            self.set('allowCachedCredentials', false);
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

    fieldsInResumeToken: RELIER_FIELDS_IN_RESUME_TOKEN
  });

  Cocktail.mixin(
    Relier,
    ResumeTokenMixin,
    SearchParamMixin
  );

  return Relier;
});
