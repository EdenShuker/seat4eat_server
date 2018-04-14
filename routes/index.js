var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Deal = require('../models/deal');
var StoreOwner = require('../models/storeOwner');
var Store = require('../models/store');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
    res.send('Hello World!');
});


// Registration of regular user
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


// Registration of store owner user
router.post('/StoreOwner/register', function (req, res) {
    var store = new Store({
        name: req.body.storeName,
        location: req.body.location
    });
    store.save(function (err, store1) {
        if (err) return console.error(err);
        else {
            StoreOwner.register(new StoreOwner({
                    username: req.body.username, email: req.body.email,
                    mobile: req.body.mobile, storeID: store1._id
                }),
                req.body.password, function (err, storeOwner) {
                    if (err) {
                        return res.send('Error: register', {storeOwner: storeOwner});
                    }
                    passport.authenticate('local')(req, res, function () {
                        res.send('store registered successfully')
                    });
                });
        }
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


// Login for store owner
router.post('/storeOwner/login', passport.authenticate('local'), function (req, res, next) {
    var promise = StoreOwner.findOne({username: req.user.username}).exec();
    promise.then(function (user) {
        req.session.user_id = user._id;
        // NOTICE: session is saved immediately only if data is sent back to the user
        // or if it done manually

        // req.session.save();
        res.send('Yoa are logged in');
    });
});


// Add Deal
router.post('/storeOwner/addDeal', checkAuth, function (req, res) {
    // var time = req.body.time;
    // var img = req.body.img;
    var deal = new Deal({
        storeOwnerID: req.session.user_id,
        details: req.body.details,
        time:  req.body.time,
        img: req.body.img
    });
    deal.save(function (err) {
        if (err) return console.error(err);
        res.send('deal added successfully!');
    });
});

//
// // Get Deals of specific store owner
// router.get('/deals/perStore', checkAuth, function (req, res) {
//     var promise = Account.findOne({username: req.query['name']}).exec();
//     promise.then(function (seller){
//         Deal.find({storeOwnerID: seller._id}).exec().then(
//             function (deals) {
//                 console.log(deals);
//                 res.send(deals);
//             }
//         );
//     });
//
// });


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