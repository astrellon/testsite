
/*
 * GET home page.
 */
mongoItems = require('../routes/items');

exports.index = function(req, res){
    res.render('index', { title: 'Express Wut' })
};
