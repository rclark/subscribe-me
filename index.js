var level = require('level');
var path = require('path');
var d3 = require('d3-queue');

module.exports = function(token, org) {
  var subscribeMe = {};
  var github = require('./lib/github')(token, org);
  var db = level(path.resolve(__dirname, 'db'));

  // setup the db with my existing subscription states
  subscribeMe.refresh = function(callback) {
    github.status(function(err, data) {
      if (err) return callback(err);

      var batch = data.map(function(repository) {
        return {
          type: 'put',
          key: org + ':' + repository.name,
          value: {
            description: repository.description,
            subscribed: repository.subscribed
          },
          valueEncoding: 'json'
        };
      });

      db.batch(batch, function(err) {
        if (err) return callback(err);
        callback(null, data);
      });
    });
  };

  // subscribe me to repos that I have not opted out of
  subscribeMe.toNew = function(callback) {
    var newSubscriptions = [];

    github.unsubscribed(function(err, data) {
      if (err) return callback(err);

      var queue = d3.queue(10);

      Object.keys(data).forEach(function(repository) {
        queue.defer(function(next) {
          var key = org + ':' + repository;

          db.get(key, function(err) {
            if (err && err.type !== 'NotFoundError') return next(err); // unknown error
            if (!err) return next(); // opted out of this one -- database already knows about it

            newSubscriptions.push({
              name: repository,
              description: data[repository]
            });

            github.subscribe(repository, next); // subscribe to the new repo
          });
        });
      });

      queue.awaitAll(function(err) {
        if (err) return callback(err);
        subscribeMe.refresh(function(err) {
          if (err) return callback(err);
          callback(null, newSubscriptions);
        });
      });
    });
  };

  // show me what the db thinks I'm subscribed to
  subscribeMe.dbStatus = function(callback) {
    var status = [];
    db.createReadStream({ valueEncoding: 'json' })
      .on('data', function(data) {
        status.push({
          name: data.key.split(':')[1],
          description: data.value.description,
          subscribed: data.value.subscribed
        });
      })
      .on('end', function() {
        callback(null, status);
      })
      .on('error', callback);
  };

  // subscribe me to all repos
  subscribeMe.all = function(callback) {
    github.subscribeAll(callback);
  };

  // show me what I'm not subscribed to
  subscribeMe.unsubscribed = function(callback) {
    github.unsubscribed(callback);
  };

  // close the db
  subscribeMe.close = function(callback) {
    db.close(callback);
  };

  return subscribeMe;
};
