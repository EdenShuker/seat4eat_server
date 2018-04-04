var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Deal = require('../models/deal');

var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
    res.send('Hello World!');
});


// Registration
router.post('/register', function (req, res) {
    Account.register(new Account({username: req.body.username}),
        req.body.password, function (err, account) {
            if (err) {
                return res.send('Error: register', {account: account});
            }
            passport.authenticate('local')(req, res, function () {
                res.send('registered successfully')
            });
        });
});


// Login
router.post('/login', passport.authenticate('local'), function (req, res, next) {
    var promise = Account.findOne({username: req.user.username}).exec();
    promise.then(function (user) {
        req.session.user_id = user._id;
        // NOTICE: session is saved immediately only if data is sent back to the user
        // or if it done manually

        // req.session.save();
        res.send('Yoa are logged in');
    });
});


// Add Deal
router.post('/addDeal', checkAuth, function (req, res) {
    var deal = new Deal({
        sellerID: req.session.user_id,
        product: req.body.product
    });
    deal.save(function (err) {
        if (err) return console.error(err);
        res.send('deal added successfully!');
    });
});


// Get Deals of specific seller
router.get('/deals/perSeller', checkAuth, function (req, res) {
    var promise = Account.findOne({username: req.query['name']}).exec();
    promise.then(function (seller){
        Deal.find({sellerID: seller._id}).exec().then(
            function (deals) {
                console.log(deals);
                res.send(deals);
            }
        );
    });

});


// TODO: Get Deals by time



// Logout
router.get('/logout', checkAuth, function (req, res) {
    delete req.session.user_id;
    req.logout();
    res.send('logout');
});


function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('You must login first!');
    } else {
        next();
    }
}

module.exports = router;