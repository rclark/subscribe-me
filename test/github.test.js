var test = require('tape');
var github = require('../lib/github')(process.env.GithubAccessToken, 'mapbox');

// test('[github.subscriptions]', function(assert) {
//   github.subscriptions(function(err, data) {
//     console.log(err || data);
//     assert.end();
//   });
// });

// test('[github.repositories]', function(assert) {
//   github.repositories(function(err, data) {
//     if (err) return assert.end(err);
//     console.log(Object.keys(data).length);
//     assert.end();
//   });
// });

// test('[github.unsubscribed]', function(assert) {
//   github.unsubscribed(function(err, data) {
//     if (err) return assert.end(err);
//     console.log(data);
//     console.log(Object.keys(data).length);
//     assert.end();
//   });
// });

// test('[github.subscribe]', function(assert) {
//   github.subscribe('cwlogs', function(err, data) {
//     if (err) return assert.end(err);
//     console.log(data);
//     assert.end();
//   });
// });

test('[github.status]', function(assert) {
  github.status(function(err, data) {
    if (err) return assert.end(err);
    data.forEach(function(repository) {
      console.log('%j', repository);
    });
    assert.end();
  });
});
