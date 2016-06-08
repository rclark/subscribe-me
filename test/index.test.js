var test = require('tape');
var subscribeMe = require('..');
var path = require('path');
var level = require('level');

test('[subscribeMe.refresh]', function(assert) {
  var s = subscribeMe(process.env.GithubAccessToken, 'mapbox');
  s.refresh(function(err, status) {
    if (err) return assert.end(err);
    console.log(status);
    s.close(function(err) {
      if (err) return assert.end(err);
      assert.end();
    });
  });
});

test('[subscribeMe.dbStatus]', function(assert) {
  var s = subscribeMe(process.env.GithubAccessToken, 'mapbox');
  s.dbStatus(function(err, status) {
    if (err) return assert.end(err);
    console.log(status);
    s.close(function(err) {
      if (err) return assert.end(err);
      assert.end();
    });
  });
});

test('[subscribeMe] delete one database record', function(assert) {
  var db = level(path.resolve(__dirname, '..', 'db'));
  db.del('mapbox:cwlogs', function(err) {
    if (err) return assert.end(err);
    db.close(function(err) {
      if (err) return assert.end(err);
      assert.end();
    });
  });
});

test('[subscribeMe.toNew]', function(assert) {
  var s = subscribeMe(process.env.GithubAccessToken, 'mapbox');
  s.toNew(function(err, newSubscriptions) {
    if (err) return assert.end(err);
    console.log(newSubscriptions);
    s.close(function(err) {
      if (err) return assert.end(err);
      assert.end();
    });
  });
});

test('[subscribeMe] check on the new subscription', function(assert) {
  var db = level(path.resolve(__dirname, '..', 'db'));
  db.get('mapbox:cwlogs', { valueEncoding: 'json' }, function(err, data) {
    if (err) return assert.end(err);
    console.log(data);
    db.close(function(err) {
      if (err) return assert.end(err);
      assert.end();
    });
  });
});
