var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var fs = require("fs");
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
    /api/accounts/photo
    POST - adds photo

####################################
*/
router.post("/photo", (req, res, next) => {
    var b64string = req.body.photo;
     var image = Buffer.from(b64string, 'base64'); //decoded image
    //var image = b64string;
    const lat = req.body.latitude;
    const lon = req.body.longitude;
    const user_id = mongojs.ObjectId(req.body.user_id);
    console.log(user_id);
    db.users.findOne({
        _id: user_id
    }, (err, user) => {
        if(err){
            res.json({
                err: err
            });
        }else if(user){
            console.log("found user");
            addCatchWithImage(user_id, lat, lon, image).then((result) => {
                if(result){
                    res.json({
                        success: "image added"
                    });
                }else{
                    res.json({
                        error: "not saved"
                    })
                }
            });
        }else{
            console.log("user not found");
        }
    })
    // fs.writeFile("/Users/madswed/Desktop/"+title+".jpg", image, function(err) {
    //     if (err) {
    //         console.log(err);
    //     }

    //     console.log("The file was saved!");
    // });

    db.users.find
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
    } else if (!user.password) {
        res.json({
            error: "You need to choose a password"
        });
    } else {
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
        } else {
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
    DELETE - delete user
    ####################################
*/
//get user details where ID = req.params.id
router.get("/admin/:id", (req, res, next) => {
    db.users.findOne({
        _id: mongojs.ObjectId(req.params.id)
    }, (err, user) => {
        if (err) {
            res.json({
                error: err
            })
        } else {
            res.json(user);
        }
    });
});


//delete a single user based on the user ID found in the mongodb 
//fix some security around this one lads
router.delete("/admin/:id", (req, res, next) => {
    findUserById(req.params.id).then((username) => {
        if (username) {
            deleteAllOccurencesOf(username).then((wentOk) => {
                if (wentOk === true) {
                    db.users.remove({
                        _id: mongojs.ObjectId(req.params.id)
                    }, (err, user) => {
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
        } else {}

    });
});


/*
####################################
    /api/accounts/caughtfish
    POST - adds a fish to "caught fish"
####################################
*/



router.post("/caughtfish", (req, res, next) => {
    const id = mongojs.ObjectID(req.body.user_id);
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    db.users.findOne({
        _id: id
    }, (err, user) => {
        if (err) {
            res.json({
                err: err
            });
        } else if (user) {
            addCatch(id, latitude, longitude).then((result) => {
                if (result) {
                    res.json({
                        success: true
                    });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
        } else {
            res.json({
                success: false
            });
        }
    })
});

function flatten(a, b) {
    return a.concat(b);
}

router.get("/caughtfish", (req, res, next) => {
    const user_id = mongojs.ObjectID(req.query.user_id);
    getFollowingList(user_id).then((friends) => {
        if (friends) {
            allPromises = friends.map(x => getFishFromFriend(x));
            Promise.all(allPromises).then((allFish) => {
                allFish = allFish
                    .filter(x => hasCaughtFish(x))
                allFish
                    .map(x => {
                        x.caughtFish = x.caughtFish
                            .filter(x => fishCaughtToday(x));
                    })
                res.json({
                    success: allFish
                })
            });
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

function addCatch(id, lat, long) {
    return new Promise(
        (resolve, reject) => {
            const dateObject = new Date();
            const year = String(dateObject.getFullYear());
            const month = String(dateObject.getMonth() + 1);
            const day = String(dateObject.getDate());

            db.users.update({ _id: id }, {
                $push: {
                    caughtFish: {
                        latitude: lat,
                        longitude: long,
                        date: year + "/" + month + "/" + day,
                        image: ""
                    }
                }
            }, (err, result) => {
                if (err) {
                    resolve(false);
                } else if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }
    );
}

function addCatchWithImage(user_id, lat, long, image) {
    return new Promise(
        (resolve, reject) => {
            const dateObject = new Date();
            const year = String(dateObject.getFullYear());
            const month = String(dateObject.getMonth() + 1);
            const day = String(dateObject.getDate());

            db.users.update({ _id: user_id }, {
                $push: {
                    caughtFish: {
                        latitude: lat,
                        longitude: long,
                        date: year + "/" + month + "/" + day,
                        image: image
                    }
                }
            }, (err, result) => {
                if (err) {
                    resolve(false);
                } else if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }
    );
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

function getFollowingList(user_id) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({
                _id: user_id
            }, (err, user) => {
                if (err) {
                    resolve(false);
                } else if (user) {
                    friends = []
                    user.following.map(x => friends.push(x.username));
                    resolve(friends);
                } else {
                    resolve(false);
                }
            });
        });
}

function getFishFromFriend(friend) {
    return new Promise(
        (resolve, reject) => {
            db.users.findOne({
                username: friend
            }, (err, user) => {
                if (err) {
                    resolve();
                } else if (user) {
                    if (user.caughtFish) {
                        resolve({
                            username: user.username,
                            caughtFish: user.caughtFish
                        });
                        //resolve(user.caughtFish);
                    } else {
                        resolve({
                            username: user.username,
                            caughtFish: []
                        });
                    }

                } else {
                    resolve();
                }
            })
        });
}

const hasCaughtFish = (x) => {
    return x.caughtFish.length > 0;
}

const fishCaughtToday = (x) => {
    const date = new Date();
    todaysDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    return x.date === todaysDate;
}

module.exports = router;