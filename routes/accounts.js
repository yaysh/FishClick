var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var db = mongojs("mongodb://localhost:27017/home", ["users"]);

/*
####################################
    /api/accounts
    POST - creates a new account
    GET - gets all accounts (remove when launch)
####################################
*/
//Get all users
router.get("/", (req, res, next) => {
    db.users.find((err, users) => {
        if (err) {
            res.json({
                "error": err
            })
        } else {
            res.json(users);
        }
    })
});

//Create user
router.post("/", (req, res, next) => {
    const user = req.body;
    if (!user.username) {
        res.status(400);
        res.json({
            "error": "You need to choose a username"
        });
    } else {
        userExists(res, user).then((doesExist) => {
            if (!doesExist) {
                user.following = []
                createUser(res, user);
            } else {
                res.json({ "error": "extremely wierd error@post create user" });
            }
        }).catch((reason) => {
            console.log("Handle rejected promise (" + reason + ") here.");
        });
    }
});

/*
####################################
    /api/accounts/followers
    POST - add a follower 
    GET - get all users User is followinug
    DELETE - remove user from Users following list
####################################
*/
router.post("/followers", (req, res, next) => {
    const followUsername = req.body.username;
    db.users.update({ username: "jens" }, {
        $push: { following: { "username": followUsername } }
    }, function(err, result) {
        if (err) {
            res.json({ "error": err });
        } else {
            res.json({ "result": result });
        }
    });
});
//Remove a follower
router.delete("/followers", (req, res, next) => {
    const unfollowUsername = req.body.username;
    db.users.update({ username: "jens" }, {
        $pull: { following: { "username": unfollowUsername } }
    }, function(err, result) {
        if (err) {
            console.log("error");
            res.json({ "error": err });
        } else {
            console.log("no error");
            res.json({ "result": result });
        }
    });
});

router.get("/followers", (req, res, next) => {
    const user = req.body;
    db.users.findOne({ "username": user.username }, (err, user) =>  {
        if (err) {
            res.json({
                "error": "error"
            });
        } else if(!user.following){
            res.json({
                "error": "user is not following anyone"
            });
        }
        else {
            res.json(user.following);
        }
    });
})


/*
    ####################################
    /api/accounts/:id
    GET - get user
    POST - update user
    DELETE - delete user
    ####################################
*/
router.get("/:id", (req, res, next) => {
    db.users.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, user) =>  {
        if (err) {
            res.json({
                "error": err
            })
        } else {
            res.json(user);
        }
    });
})

//delete a single user based on the user ID found in the mongodb 
//fix some security around this one lads
router.delete("/:id", (req, res, next) => {
    db.users.remove({ _id: mongojs.ObjectId(req.params.id) }, (err, user) => {
        if (err) {
            console.log("error")
            res.json({
                "error": err
            })
        } else {
            res.json(user);
        }
    });
});

/*
####################################
    /api/accounts/login
    POST - login user
####################################
*/
router.post("/login", (req, res, next) => {
    const user = req.body;
    db.users.findOne({ "username": user.username, "password": user.password }, (err, user) =>  {
        if (err) {
            res.json({
                "error": err
            })
        } else if (user) {
            res.json(user);
        } else {
            res.json({ "error": "username or account wrong" });
        }
    });
})

/*
    The following two functions are helper functions for creating the account
    We need to create an async request that checks if the user exists in the DB
    and if he doesn"t we want to add the user to the db and send a confirmation
    that the user was created
*/
function createUser(res, user) {
    db.users.save(user, (err, user) => {
        if (err) {
            res.json({ "error": "error inside users.save" });
        }
        console.log(user);
        res.json(user);
    });
}

function userExists(res, user) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({ username: user.username }, (err, user) => {
                if (err) {
                    res.json({ "error": "userExists error" });
                } else {
                    if (user) {
                        res.json({ "error": "user already exists" });
                    } else {
                        resolve(false);
                    }
                }
            });
        }
    );
}
/*
    Create user functions end here
*/


module.exports = router;