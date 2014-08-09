var mongo = require('mongodb')
  , mongoServer = require('./server')
  , utils = require('../utils');

var BSON = mongo.BSONPure;

function Collection(name, db) {
    this.name = name;
    this.db = db;
}
var fn = Collection.prototype;

fn.init = function(callback) {
    this.db.collection(this.name, {strict: true}, function(err, collection) {
        if (typeof(callback) === "function") {
            callback(err);
        }
    });
};

fn.findById = function(id, callback) {
    if (typeof(callback) !== "function") {
        console.log("Cannot find by id '" + id + "' without a callback");
        return;
    }
    this.db.collection(this.name, function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item) {
            callback(err, item);
        });
    });
}
fn.urlFindById = function(req, res) {
    var id = req.params.id;
    this.findById(id, function(err, item) {
        res.send(item);
    });
}


fn.findAll = function(callback) {
    if (typeof(callback) !== "function") {
        console.log("Cannot find all without a callback");
        return;
    }
    this.db.collection(this.name, function(err, collection) {
        if (err) {
            callback(err, null);
            return;
        }
        collection.find().toArray(function(err, items) {
            callback(err, items);
        });
    });
}
fn.urlFindAll = function(req, res) {
    this.findAll(function(err, items) {
        res.send(items);
    });
}
fn.addItem = function(item, callback) {
    item._timestamp = (new Date()).getTime();
    console.log("Adding item to collection: ", item);
    this.db.collection(this.name, function(err, collection) {
        collection.insert(item, {safe: true}, function(err, result) {
            if (typeof(callback) === "function") {
                callback(err, result);
            }
        });
    })
}
fn.deleteItem = function(id, callback) {
    this.db.collection(this.name, function(err, collection) {
        if (err && typeof(callback) === "function") {
            callback(err, null);
            return;
        }
        var objId = {'_id': new BSON.ObjectID(id)};
        collection.remove(objId, {safe: true}, function(err, result) {
            if (typeof(callback) === "function") {
                callback(err, result);
            }
        });
    });
}
fn.updateItem = function(id, item, callback) {
    this.db.collection(this.name, function(err, collection) {
        if (err) {
            if (typeof(callback) === "function") {
                callback(err, null);
            }
            return;
        }
        var objId = {'_id': new BSON.ObjectID(id)};
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, origItem) {
            if (err) {
                if (typeof(callback) === "function") {
                    callback(err, null);
                }
                return;
            }
            var merged = {};
            utils.mergeObjects(merged, origItem, item);
            collection.update(objId, merged, {safe: true}, function(err, result) {
                if (typeof(callback) === "function") {
                    callback(err, result);
                }
            });
        });
    });
}
fn.deleteAll = function(callback) {
    this.db.dropCollection(this.name, function(err, result) {
        if (typeof(callback) === "function") {
            callback(err, result);
        }
    });
}
fn.urlAddItem = function(req, res) {
    var item = req.body;
    console.log("Adding item to: ", this);
    this.addItem(item, function(err, result) {
        if (err) {
            res.send({'error': 'An error has occured'});
        }
        else {
            res.send(result[0]);
        }
    });
}
fn.urlUpdateItem = function(req, res) {
    var id = req.params.id;
    var item = req.body;
    this.updateItem(id, item, function(err, result) {
        if (err) {
            console.log('Error updating item: ' + err);
            res.send({'error': 'An error has occured'});
        }
        else {
            console.log('' + result + ' items updated');
            res.send(item);
        }
    });
}

fn.urlDeleteItem = function(req, res) {
    var id = req.params.id;
    console.log("Deleting item: ", id);
    this.deleteItem(id, function(err, result) {
        if (err) {
            console.log("Error deleting item: ", id);
            res.send({'error': 'An error has occured - ' + err});
        }
        else {
            console.log('' + result + ' items deleted');
            res.send(req.body);
        }
    });
}
fn.urlDeleteAll = function(req, res) {
    this.deleteAll(function(err, result) {
        if (err) {
            res.send("Error dropping table: " + err);
        }
        else {
            res.send("Dropped collection: " + result);
        }
    });
}
fn.addUrlsToApp = function(app, url) {
    var self = this;
    this.init(function(err) {
        app.get(url, (self.urlFindAll).bind(self));
        app.get(url + '/:id', (self.urlFindById).bind(self));
        app.post(url, (self.urlAddItem).bind(self));
        app.put(url + '/:id', (self.urlUpdateItem).bind(self));
        app.delete(url + '/:id', (self.urlDeleteItem).bind(self));
        app.delete(url, (self.urlDeleteAll).bind(self));
    });
}

exports.Collection = Collection;

var collections = {}
function getCollection(name, db) {
    if (collections[name]) {
        return collections[name];
    }
    var collection = new Collection(name, db);
    Collection[name] = collection;
    return collection;
}
exports.getCollection = getCollection;
