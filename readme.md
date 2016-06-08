# subscribe-me

... to github repositories that I'm not watching

## Install

```
$ git clone https://github.com/rclark/subscribe-me
$ cd subscribe-me && npm link
```

## Configure

Make sure you have a `$GithubAccessToken` env var set

## Run once

Sets up a local store of your present subscription states

```
$ subscribe-me initialize mapbox
```

## Run frequently

Subscribes you to repositories you haven't been subscribed to before

```
$ subscribe-me update mapbox
```

## If you're curious

See what the db thinks you are & are not subscribed to

```
$ subscribe-me dump mapbox
```

## If you're brave

Subscribe to everything

```
$ subscribe-me all mapbox
```
