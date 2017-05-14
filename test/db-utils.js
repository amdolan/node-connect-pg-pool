'use strict';

const pathModule = require('path');

const denodeify = require('denodeify');
const pg = require('pg');

const readFile = denodeify(require('fs').readFile);

const tables = ['session'];

const config = {
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'connect_pg_pool_test'
};

const queryPromise = function (query, params) {
  return new Promise((resolve, reject) => {
    pg.connect(config, (err, client, done) => {
      if (err) {
        done(client);
        reject(err);
      } else {
        client.query(query, params || [], (err, result) => {
          done(err || false);
          err ? reject(err) : resolve(result);
        });
      }
    });
  });
};

const removeTables = function () {
  return Promise.all(tables.map(table => queryPromise('DROP TABLE IF EXISTS ' + table)));
};

const initTables = function () {
  return readFile(pathModule.resolve(__dirname, '../table.sql'), 'utf8')
    .then(tableDef => queryPromise(tableDef));
};

module.exports = Object.freeze({
  config,
  queryPromise,
  removeTables,
  initTables
});
