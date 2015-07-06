/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/constants',
  'models/reliers/relier',
  'models/resume-token',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, Constants, Relier, ResumeToken, WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('models/reliers/relier', function () {
    var relier;
    var windowMock;

    var SERVICE = 'service';
    var SYNC_SERVICE = 'sync';
    var PREVERIFY_TOKEN = 'abigtoken';
    var EMAIL = 'email';
    var UID = 'uid';
    var ENTRYPOINT = 'preferences';
    var CAMPAIGN = 'fennec';
    var SETTING = 'avatar';
    var UTM_CAMPAIGN = 'utm_campaign';
    var UTM_CONTENT = 'utm_content';
    var UTM_MEDIUM = 'utm_medium';
    var UTM_SOURCE = 'utm_source';
    var UTM_TERM = 'utm_term';

    beforeEach(function () {
      windowMock = new WindowMock();

      relier = new Relier({
        window: windowMock
      });
    });

    describe('fetch', function () {
      it('populates expected fields from the search parameters, unexpected search parameters are ignored', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          allowCachedCredentials: false,
          campaign: CAMPAIGN,
          email: EMAIL,
          entrypoint: ENTRYPOINT,
          ignored: 'ignored',
          preVerifyToken: PREVERIFY_TOKEN,
          service: SERVICE,
          setting: SETTING,
          uid: UID,
          utm_campaign: UTM_CAMPAIGN,
          utm_content: UTM_CONTENT,
          utm_medium: UTM_MEDIUM,
          utm_source: UTM_SOURCE,
          utm_term: UTM_TERM
        });

        return relier.fetch()
            .then(function () {
              // not imported from the search parameters, but is set manually.
              assert.isTrue(relier.get('allowCachedCredentials'));

              assert.equal(relier.get('campaign'), CAMPAIGN);
              assert.equal(relier.get('email'), EMAIL);
              assert.equal(relier.get('entrypoint'), ENTRYPOINT);
              assert.equal(relier.get('preVerifyToken'), PREVERIFY_TOKEN);
              assert.equal(relier.get('service'), SERVICE);
              assert.equal(relier.get('setting'), SETTING);
              assert.equal(relier.get('uid'), UID);
              assert.equal(relier.get('utm_campaign'), UTM_CAMPAIGN);
              assert.equal(relier.get('utm_campaign'), UTM_CAMPAIGN);
              assert.equal(relier.get('utm_content'), UTM_CONTENT);
              assert.equal(relier.get('utm_medium'), UTM_MEDIUM);
              assert.equal(relier.get('utm_source'), UTM_SOURCE);
              assert.equal(relier.get('utm_term'), UTM_TERM);

              assert.isFalse(relier.has('ignored'));
            });
      });
    });

    describe('isOAuth', function () {
      it('returns `false`', function () {
        assert.isFalse(relier.isOAuth());
      });
    });

    describe('isFxDesktop', function () {
      it('returns `false`', function () {
        assert.isFalse(relier.isFxDesktop());
      });
    });

    describe('isSync', function () {
      it('returns true if `service=sync`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          service: SYNC_SERVICE
        });

        return relier.fetch()
            .then(function () {
              assert.isTrue(relier.isSync());
            });
      });

      it('returns false otw', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          service: SERVICE
        });

        return relier.fetch()
            .then(function () {
              assert.isFalse(relier.isSync());
            });
      });
    });

    describe('allowCachedCredentials', function () {
      it('returns `true` if `email` not set', function () {
        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.allowCachedCredentials());
          });
      });

      it('returns `true` if `email` is set to an email address', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          email: 'testuser@testuser.com'
        });

        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.allowCachedCredentials());
          });
      });

      it('returns `false` if `email` is set to `blank`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          email: Constants.DISALLOW_CACHED_CREDENTIALS
        });

        return relier.fetch()
          .then(function () {
            assert.isFalse(relier.allowCachedCredentials());

            // the email should not be set on the relier model
            // if the specified email === blank
            assert.isFalse(relier.has('email'));
          });
      });
    });

    describe('pickResumeTokenInfo', function () {
      it('returns an object with info to be passed along with email verification links', function () {
        var CAMPAIGN = 'campaign id';
        var ENTRYPOINT = 'entry point';

        relier.set({
          campaign: CAMPAIGN,
          entrypoint: ENTRYPOINT,
          notPassed: 'this should not be picked'
        });

        assert.deepEqual(relier.pickResumeTokenInfo(), {
          campaign: CAMPAIGN,
          entrypoint: ENTRYPOINT
        });
      });
    });

    describe('re-population from resume token', function () {
      it('parses the resume param into an object', function () {
        var CAMPAIGN = 'campaign id';
        var ENTRYPOINT = 'entry point';
        var resumeData = {
          campaign: CAMPAIGN,
          entrypoint: ENTRYPOINT,
          notImported: 'this should not be picked'
        };
        var resumeToken = ResumeToken.stringify(resumeData);

        windowMock.location.search = TestHelpers.toSearchString({
          resume: resumeToken
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('campaign'), CAMPAIGN);
            assert.equal(relier.get('entrypoint'), ENTRYPOINT);
            assert.isUndefined(relier.get('notImported'), 'only allow specific resume token values');
          });
      });
    });
  });
});

