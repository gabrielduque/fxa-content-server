/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'backbone',
  'chai',
  'cocktail',
  'models/mixins/resume-token',
  'models/resume-token'
], function (Backbone, chai, Cocktail, ResumeTokenMixin, ResumeToken) {
  'use strict';

  var assert = chai.assert;

  describe('models/mixins/resume-token', function () {
    var model;
    var CAMPAIGN = 'campaign id';

    var Model = Backbone.Model.extend({
      initialize: function (options) {
        this.window = options.window;
      },

      fieldsInResumeToken: ['campaign']
    });

    Cocktail.mixin(
      Model,
      ResumeTokenMixin
    );

    beforeEach(function () {
      model = new Model({});
    });

    describe('pickResumeTokenInfo', function () {
      it('returns an object with info to be passed along with email verification links', function () {
        model.set({
          notResumeable: 'this should not be picked',
          campaign: CAMPAIGN
        });

        assert.deepEqual(model.pickResumeTokenInfo(), {
          campaign: CAMPAIGN
        });
      });
    });

    describe('populateFromStringifiedResumeToken', function () {
      it('parses the resume param into an object', function () {
        var resumeData = {
          campaign: CAMPAIGN,
          notResumeable: 'this should not be picked'
        };
        var stringifiedResumeToken = ResumeToken.stringify(resumeData);

        model.populateFromStringifiedResumeToken(stringifiedResumeToken);

        assert.equal(model.get('campaign'), CAMPAIGN);
        assert.isUndefined(model.get('notResumeable'), 'only allow specific resume token values');
      });
    });
  });
});


