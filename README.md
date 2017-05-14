# Connect PG Pool

A simple, minimal PostgreSQL session store for Express/Connect with connection pooling.

[![Build Status](https://travis-ci.org/nDmitry/node-connect-pg-pool.svg?branch=master)](https://travis-ci.org/nDmitry/node-connect-pg-pool)
[![Coverage Status](https://img.shields.io/coveralls/nDmitry/node-connect-pg-pool.svg)](https://coveralls.io/r/nDmitry/node-connect-pg-pool)
[![Dependency Status](https://gemnasium.com/nDmitry/node-connect-pg-pool.svg)](https://gemnasium.com/nDmitry/node-connect-pg-pool)

## Installation

```bash
npm install connect-pg-pool
```

Once npm installed the module, you need to create the **session** table in your database. For that you can use the [table.sql] (https://github.com/nDmitry/node-connect-pg-pool/blob/master/table.sql) file provided with the module:

```bash
psql mydatabase < node_modules/connect-pg-pool/table.sql
```

Or simply play the file via a GUI, like the pgAdminIII queries tool.

## Usage

Express 4:

```javascript
const session = require('express-session');
const pg = require('pg');

// create a pool once per process and reuse it
const pool = new pg.Pool(/* { your DB config } */);

app.use(session({
  store: new (require('connect-pg-pool')(session))({
    pool: pool // required option
  }),
  secret: process.env.FOO_COOKIE_SECRET,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
```

Express 3 (and similar for Connect):

```javascript
const express = require('express');
const pg = require('pg');

const pool = new pg.Pool(/* { your DB config } */);

app.use(session({
  store: new (require('connect-pg-simple')(express.session))({
    pool: pool // required option
  }),
  secret: process.env.FOO_COOKIE_SECRET,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
```

## Advanced options

* **pool** - Required. The session store will use the same connection pool as the rest of your app.
* **ttl** - the time to live for the session in the database – specified in seconds. Defaults to the cookie maxAge if the cookie has a maxAge defined and otherwise defaults to one day.
* **schemaName** - if your session table is in another Postgres schema than the default (it normally isn't), then you can specify that here.
* **tableName** - if your session table is named something else than `session`, then you can specify that here.
* **pruneSessionInterval** - sets the delay in seconds at which expired sessions are pruned from the database. Default is `60` seconds. If set to `false` no automatic pruning will happen. Automatic pruning weill happen `pruneSessionInterval` seconds after the last pruning – manual or automatic.
* **errorLog** – the method used to log errors in those cases where an error can't be returned to a callback. Defaults to `console.error()`, but can be useful to override if one eg. uses [Bunyan](https://github.com/trentm/node-bunyan) for logging.

## Useful methods

* **close()** – if automatic interval pruning is on, which it is by default as of `3.0.0`, then the timers will block any graceful shutdown unless you tell the automatic pruning to stop by closing the session handler using this method.
* **pruneSessions([callback(err)])** – will prune old sessions. Only really needed to be called if **pruneSessionInterval** has been set to `false` – which can be useful if one wants improved control of the pruning.
