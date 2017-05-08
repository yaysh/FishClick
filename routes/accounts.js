var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var db = mongojs("mongodb://localhost:27017/home", ["users"]);

/*
####################################
    /api/accounts/login
    POST - login user
####################################
*/
router.post("/login", (req, res, next) => {
    const user = req.body;
    db.users.findOne({ username: user.username, password: user.password }, (err, user) => {
        if (err) {
            res.json({
                error: err
            })
        } else if (user) {
            res.json(user);
        } else {
            res.json({
                error: "username or account wrong"
            });
        }
    });
});

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
                error: err
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
        res.json({
            error: "You need to choose a username"
        });
    } else if(!user.password){
        res.json({
            error: "You need to choose a password"
        });
    }else {
        userExists(user.username).then((doesExist) => {
            if (!doesExist) {
                user.following = [{ username: user.username }]
                createUser(res, user);
            } else {
                res.json({
                    error: "Username is already taken"
                });
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
    GET - get all users User is following
####################################
*/
router.post("/followers", (req, res, next) => {
    const user_id = req.body.user_id;
    const want_to_follow = req.body.want_to_follow;


    userExists(want_to_follow).then((doesExist) => {
        if (doesExist) {
            isAlreadyFollowing(res, user_id, want_to_follow).then((isFollowing) => {
                if (!isFollowing) {
                    db.users.update({ _id: mongojs.ObjectId(user_id) }, {
                        $push: { following: { username: want_to_follow } }
                    }, function(err, result) {
                        if (err) {
                            res.json({
                                error: err
                            });
                        } else {
                            res.json({
                                "result": "added friend"
                            });
                        }
                    });

                } else {
                    res.json({
                        error: "huh"
                    });
                }
            });
        } else {
            res.json({
                error: "user doesn't exist"
            })
        }

    });

});

router.get("/followers", (req, res, next) => {
    const user_id = req.query.user_id;
    db.users.findOne({ _id: mongojs.ObjectId(user_id) }, (err, user) => {
        if (err) {
            res.json({
                error: "error"
            });
        } else if (!user.following) {
            res.json({
                error: "user is not following anyone"
            });
        } else {
            res.json({
                result: user.following
            });
        }
    });
});

/*
####################################
    /api/accounts/unfollow
    POST - remove a follower
####################################
*/
//Remove a follower
router.post("/unfollow", (req, res, next) => {
    const user_id = req.body.user_id
    const unfollowUsername = req.body.want_to_unfollow;

    userExists(unfollowUsername).then((doesExist) => {
        if (doesExist) {
            userIdBelongsToUser(user_id, unfollowUsername).then((result) => {
                if (result) {
                    res.json({
                        error: "cant unfollow yourself"
                    });
                } else {
                    console.log(result);
                    db.users.update({ _id: mongojs.ObjectId(user_id) }, {
                        $pull: { following: { username: unfollowUsername } }
                    }, function(err, result) {
                        if (err) {
                            res.json({
                                error: err
                            });
                        } else {
                            res.json({
                                result: "unfollowed"
                            });
                        }
                    });
                }
            });
        }else{
            res.json({
                error: "user doesn't exist"
            })
        }
    });
});



/*
    ####################################
    /api/accounts/:id
    GET - get user
    POST - update user
    DELETE - delete user
    ####################################
*/
//get user details where ID = req.params.id
router.get("/:id", (req, res, next) => {
    db.users.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, user) => {
        if (err) {
            res.json({
                error: err
            })
        } else {
            res.json(user);
        }
    });
});

//update user details where ID = req.params.id
router.post("/:id", (req, res, next) => {
    db.users.findOne({ _id: mongojs.ObjectId(req.params.id) }, (err, user) => {
        if (err) {
            res.json({
                error: err
            })
        } else {
            //Logic here pls
        }
    });
});

//delete a single user based on the user ID found in the mongodb 
//fix some security around this one lads
router.delete("/:id", (req, res, next) => {
    findUserById(req.params.id).then((username) => {
        if (username) {
            deleteAllOccurencesOf(username).then((wentOk) => {
                if (wentOk === true) {
                    db.users.remove({ _id: mongojs.ObjectId(req.params.id) }, (err, user) => {
                        if (err) {
                            res.json({
                                error: err
                            })
                        } else {
                            res.json(user);
                        }
                    });
                }
            });
        } else {
            console.log("no username")
        }

    });
});

/*
    The following two functions are helper functions for creating the account
    We need to create an async request that checks if the user exists in the DB
    and if he doesn"t we want to add the user to the db and send a confirmation
    that the user was created
*/
function createUser(res, user) {
    db.users.save(user, (err, user) => {
        if (err) {
            res.json({
                error: "error inside users.save"
            });
        }
        res.json({
            result: user.username + " was created"
        });
    });
}


function userExists(username) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({ username: username }, (err, user) => {
                if (err) {
                    resolve(false);
                } else {
                    if (user) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        }
    );
}

function deleteAllOccurencesOf(username) {
    return new Promise(
        (resolve, reject) => {
            db.users.update({}, {
                $pull: { following: { username: username } }
            }, { multi: true }, (err, result) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
}

function userIdBelongsToUser(user_id, username) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({
                username: username
            }, (err, user) => {
                if (err) {
                    resolve(false);
                } else if (user) {
                    if (user._id.toString() === user_id) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
                resolve(false);
            });
        });
}

function findUserById(id) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({
                _id: mongojs.ObjectId(id)
            }, (err, user) => {
                if (err) {
                    resolve("error" + err);
                } else if (user) {
                    resolve(user.username);
                } else {
                    resolve("error");
                }
            })
        }
    )
}

/*
    Helper function for 
        /api/accounts/followers
*/

//Check if User1 (user_id) is already following User2 (want_to_follow)
//user id is a String _id and want_to_follow is a String username
function isAlreadyFollowing(res, user_id, want_to_follow) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({
                _id: mongojs.ObjectId(user_id),
                following: {
                    username: want_to_follow
                }
            }, (err, user) => {
                if (err) {
                    resolve(false);
                } else if (user) {
                    res.json({
                        error: "already following"
                    });
                } else {
                    resolve(false);
                }
            });
        });
}


module.exports = router;