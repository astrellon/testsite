var mongo = require('mongodb');

var servers = {};
var dbs = {}

function getId(host, port) {
    return host + '_' + port;
}
function getServer(host, port) {
    var id = getId(host, port);
    if (servers[id]) {
        return servers[id];
    }

    servers[id] = new mongo.Server(host, port, {auto_reconnect: true});
    return servers[id];
}
function getDb(host, port, dbName) {
    if (arguments.length === 1) {
        if (dbs[host]) {
            return dbs[host];
        }
        return null;
    }
    if (dbs[dbName]) {
        return dbs[dbName];
    }

    var server = getServer(host, port);
    var db = new mongo.Db(dbName, server, {safe: true});
    dbs[dbName] = db;
    return db;
}

exports.get = function(host, port) {
    return getServer(host, port);
}
exports.getDb = function(host, port, dbName) {
    return getDb(host, port, dbName);
}
