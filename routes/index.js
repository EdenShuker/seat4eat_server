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
        req.body.password, function (err) {
            if (err) {
                res.status(400).send('error');
            }
            passport.authenticate('user')(req, res, function () {
                res.send('registered successfully')
            });
        });
});


// Registration of store owner user
router.post('/storeOwner/register', function (req, res) {
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
                req.body.password, function (err) {
                    if (err) {
                        res.status(400).send('error');
                    }
                    passport.authenticate('StoreOwner')(req, res, function () {
                        res.send('store registered successfully')
                    });
                });
        }
    });

});


// Login
router.post('/login', passport.authenticate('user'), function (req, res, next) {
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
router.post('/storeOwner/login', passport.authenticate('StoreOwner'), function (req, res, next) {
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
router.post('/storeOwner/addDeal', checkAuthOwner, function (req, res) {
    var promise = StoreOwner.find({_id: req.session.user_id}).exec();
    promise.then(function (owner) {
        var deal = new Deal({
            storeOwnerID: owner._id,
            storeID: owner.storeID,
            details: req.body.details,
            time: req.body.time,
            img: req.body.img
        });
        deal.save(function (err) {
            if (err) res.status(400).send('error');
            res.send('deal added successfully!');
        });
    });

});


// Get deals
router.get('/deals', checkAuth, function (req, res) {
    Deal.find({}).populate({path: 'storeID'}).exec(function (err, deals) {
        res.send(deals);
    });
});


// Logout
router.get('/logout', checkAuth, function (req, res) {
    delete req.session.user_id;
    req.logout();
    res.send('logout');
});

router.get('/storeOwner/logout', checkAuthOwner, function (req, res) {
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

function checkAuthOwner(req, res, next) {
    if (!req.session.user_id) {
        res.send('You must login first!');
    } else {
        var promise = StoreOwner.findOne({_id: req.session.user_id}).exec();
        promise.then(function (user) {
            if (!user) {
                res.send("you are not owner");
            }
            else {
                next();
            }
        });
    }
}


module.exports = router;