
/*
 * GET home page.
 */
//mongoItems = require('../routes/items');
var mongoCollection = require('./mongo/collection.js');
var mongoItems = null;
var mongoUsers = null;

exports.setItemCollection = function(collection) {
    mongoItems = collection;
}

exports.index = function(req, res){
    mongoItems.findAll(function(err, items) {
        if (err) {
            items = [{text: 'Error getting items: ' + err, id: 'error'}];
        }
        res.render('index', { 
            title: 'Express Wut',
            items: items
        })
    });

};
