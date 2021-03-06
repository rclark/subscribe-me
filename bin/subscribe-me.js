#!/usr/bin/env node

var subscribeMe = require('..');
var path = require('path');
var fs = require('fs');

var args = process.argv.slice(2);
var command = args[0];

fs.stat(path.resolve(__dirname, '..', 'db'), function(err) {
  if (err && command !== 'initialize') {
    console.error('Must initialize first');
    process.exit(1);
  }

  var s = subscribeMe(process.env.GithubAccessToken, args[1]);

  if (command === 'initialize') return s.refresh(function(err) {
    if (err) throw err;
    console.log('Initialized db with existing subscription info');
  });

  if (command === 'update') return s.toNew(function(err, newSubscriptions) {
    if (err) throw err;
    newSubscriptions.forEach(function(subscription) {
      console.log('%s: %s', subscription.name, subscription.description);
    });
  });

  if (command === 'dump') return s.dbStatus(function(err, subscriptions) {
    if (err) throw err;
    var total = 0, subscribed = 0, unsubscribed = 0;
    subscriptions.forEach(function(subscription) {
      total++;
      if (subscription.subscribed) subscribed++;
      else unsubscribed++;
      
      console.log('%s %s: %s', subscription.subscribed ? '✔' : '✘', subscription.name, subscription.description);
    });
    console.log('%s repositories, %s subscriptions, %s not watching', total, subscribed, unsubscribed);
  });

  if (command === 'all') return s.all(function(err) {
    if (err) throw err;
    console.log('You are subscribed to everything');
  });
});
