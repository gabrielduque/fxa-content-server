/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model mixin to work with ResumeTokens.
 *
 * Get model values for use in a ResumeToken with `pickResumeTokenInfo`
 * Populate a model from a stringified ResumeToken with
 *   `populateFromResumeString`
 *
 * A model should set the array `fieldsInResumeToken` to add/change
 * fields that are saved to and populated from the ResumeToken.
 */

define([
  'models/resume-token'
], function (ResumeToken) {
  'use strict';

  return {
    /**
     * Get a hash of values that can be used in a ResumeToken
     *
     * @method pickResumeTokenInfo
     * @returns {Object}
     */
    pickResumeTokenInfo: function () {
      if (this.fieldsInResumeToken) {
        return this.pick(this.fieldsInResumeToken);
      }
    },

    /**
     * Sets model properties from the resume string value
     *
     * @method populateFromStringifiedResumeToken
     * @param {String} stringifiedResumeToken
     */
    populateFromStringifiedResumeToken: function (stringifiedResumeToken) {
      if (this.fieldsInResumeToken) {
        var resumeToken =
          ResumeToken.createFromStringifiedResumeToken(stringifiedResumeToken);

        this.set(resumeToken.pick(this.fieldsInResumeToken));
      }
    }
  };
});

