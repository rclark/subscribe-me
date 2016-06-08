var request = require('request');
var url = require('url');
var d3 = require('d3-queue');

module.exports = function(token, org) {
  function send(method, path, body, callback) {
    var results = [];

    function makeRequest(options, callback) {
      request(options, function(err, res, body) {
        if (err) return callback(err);

        if (Array.isArray(body))
          for (var i = 0; i < body.length; i++) results.push(body[i]);

        if (res.headers.link) {
          var m = res.headers.link.match(/<(.*)>; rel="next",/);
          if (m) {
            options.qs.page = url.parse(m[1], true).query.page;
            return makeRequest(options, callback);
          }
        }

        callback(null, results);
      });
    }

    if (typeof body === 'function') {
      callback = body;
      body = undefined;
    }

    var options = {
      baseUrl: 'https://api.github.com',
      uri: path,
      method: method,
      qs: { access_token: token },
      json: true,
      body: body,
      headers: { 'User-Agent': 'github.com/rclark/subscribe-me' }
    };

    makeRequest(options, callback);
  }

  var github = {};

  github.repositories = function(callback) {
    send('GET', '/orgs/' + org + '/repos', function(err, data) {
      if (err) return callback(err);

      var result = data.filter(function(repository) {
        return repository.owner.login === org;
      }).reduce(function(result, repository) {
        result[repository.name] = repository.description;

        return result;
      }, {});

      callback(null, result);
    });
  };

  github.subscriptions = function(callback) {
    send('GET', '/user/subscriptions', function(err, data) {
      if (err) return callback(err);

      var result = data.filter(function(subscription) {
        return subscription.owner.login === org;
      }).reduce(function(result, subscription) {
        result[subscription.name] = true;
        return result;
      }, {});

      callback(null, result);
    });
  };

  github.status = function(callback) {
    d3.queue(2)
      .defer(github.repositories)
      .defer(github.subscriptions)
      .await(function(err, repositories, subscriptions) {
        if (err) return callback(err);

        var result = Object.keys(repositories).reduce(function(result, repository) {
          result.push({
            name: repository,
            description: repositories[repository],
            subscribed: !!subscriptions[repository]
          });
          return result;
        }, []);

        callback(null, result);
      });
  };

  github.unsubscribed = function(callback) {
    d3.queue(2)
      .defer(github.repositories)
      .defer(github.subscriptions)
      .await(function(err, repositories, subscriptions) {
        if (err) return callback(err);

        var result = Object.keys(repositories).filter(function(repository) {
          return !subscriptions[repository];
        }).reduce(function(result, name) {
          result[name] = repositories[name];
          return result;
        }, {});

        callback(null, result);
      });
  };

  github.subscribe = function(repo, callback) {
    send('PUT', ['', 'repos', org, repo, 'subscription'].join('/'), { subscribed: true }, callback);
  };

  github.subscribeAll = function(callback) {
    github.unsubscribed(function(err, unsubscribed) {
      var queue = d3.queue(10);
      Object.keys(unsubscribed).forEach(function(name) {
        queue.defer(github.subscribe, name);
      });
      queue.awaitAll(function(err) {
        if (err) return callback(err);
        callback(null, Object.keys(unsubscribed));
      });
    });
  };

  return github;
};
