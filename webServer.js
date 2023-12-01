/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

// ADDED IN PROJ7
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const ActivityEvent = require("./schema/activityEvent.js");
// Import password hashing functions
const passwordFxns = require('./password');

function logEvent(type, photo_filename = null, user = null) {
    let event = new ActivityEvent({
        type: type, photo_filename: photo_filename, user: user
    });
    event.save();
}

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
    useNewUrlParser: true, useUnifiedTopology: true,
});

// (http://expressjs.com/en/starter/static-files.html) do all
// // We have the express static module the work for us.
app.use(express.static(__dirname));
// ADDED IN PROJ7
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get("/", function (request, response) {
    response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
    if (request.session.login_name) {

        const param = request.params.p1 || "info";

        if (param === "info") {
            // Fetch the SchemaInfo. There should only one of them. The query of {} will
            // match it.
            SchemaInfo.find({}, function (err, info) {
                if (err) {
                    // Query returned an error. We pass it back to the browser with an
                    // Internal Service Error (500) error code.
                    console.error("Error in /user/info:", err);
                    response.status(500)
                        .send(JSON.stringify(err));
                    return;
                }
                if (info.length === 0) {
                    // Query didn't return an error but didn't find the SchemaInfo object -
                    // This is also an internal error return.
                    response.status(400)
                        .send("Missing SchemaInfo");
                    return;
                }

                // We got the object - return it in JSON format.
                response.end(JSON.stringify(info[0]));
            });
        } else if (param === "counts") {
            // In order to return the counts of all the collections we need to do an
            // async call to each collection. That is tricky to do so we use the async
            // package do the work. We put the collections into array and use async.each
            // to do each .count() query.
            const collections = [{
                name: "user", collection: User
            }, {
                name: "photo", collection: Photo
            }, {
                name: "schemaInfo", collection: SchemaInfo
            },];
            async.each(collections, function (col, done_callback) {
                col.collection.countDocuments({}, function (err, count) {
                    col.count = count;
                    done_callback(err);
                });
            }, function (err) {
                if (err) {
                    response.status(500)
                        .send(JSON.stringify(err));
                } else {
                    const obj = {};
                    for (let i = 0; i < collections.length; i++) {
                        obj[collections[i].name] = collections[i].count;
                    }
                    response.end(JSON.stringify(obj));
                }
            });
        } else {
            // If we know understand the parameter we return a (Bad Parameter) (400)
            // status.
            response.status(400)
                .send("Bad param " + param);
        }
    } else {
        response.status(401).send();
    }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
    if (request.session.login_name) {
        User.find({}, {
            _id: 1, first_name: 1, last_name: 1
        }, function (err, users) {
            if (err) {
                console.error("Error in /user/list", err);
                response.status(500)
                    .send(JSON.stringify(err));
                return;
            }
            if (users.length === 0) {
                response.status(400)
                    .send();
                return;
            }
            response.end(JSON.stringify(users));
        });
    } else {
        response.status(401).send();
    }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
    if (request.session.login_name) {
        const id = request.params.id;
        let mongoTargetObj;
        try {
            mongoTargetObj = new mongoose.Types.ObjectId(id);
        } catch (e) {
            response.status(400).send();
        }

        User.find({_id: {$eq: mongoTargetObj}}, {__v: 0}, function (err, user) {
            if (err) {
                console.error("Error in /user/:id", err);
                response.status(500)
                    .send(JSON.stringify(err));
                return;
            }
            if (user.length === 0) {
                response.status(400)
                    .send();
                return;
            }
            const userDTO = {
                _id: user[0]._id,
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                location: user[0].location,
                description: user[0].description,
                occupation: user[0].occupation
            };
            response.end(JSON.stringify(userDTO));
        });
    } else {
        response.status(401).send();
    }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
    if (request.session.login_name) {
        const id = request.params.id;
        let mongoTargetObj;
        try {
            mongoTargetObj = new mongoose.Types.ObjectId(id);
        } catch (e) {
            response.status(400).send();
        }

        Photo.aggregate([{
            $match: {user_id: {$eq: mongoTargetObj}}
        }, {
            $addFields: {
                comments: {$ifNull: ["$comments", []]}
            }
        }, {
            $lookup: {
                from: "users", localField: "comments.user_id", foreignField: "_id", as: "users"
            }
        }, {
            $addFields: {
                comments: {
                    $map: {
                        input: "$comments",
                        in: {
                            $mergeObjects: ["$$this", {
                                user: {
                                    $arrayElemAt: ["$users", {
                                        $indexOfArray: ["$users._id", "$$this.user_id"]
                                    }]
                                }
                            }]
                        }
                    }
                }
            }
        }, {
            $project: {
                users: 0,
                __v: 0,
                "comments.__v": 0,
                "comments.user_id": 0,
                "comments.user.login_name": 0,
                "comments.user.password": 0,
                "comments.user.location": 0,
                "comments.user.description": 0,
                "comments.user.occupation": 0,
                "comments.user.__v": 0
            }
        }, {
            $addFields: {
                liked_count: {
                    $size: {
                        "$ifNull": ["$liked_by", []]
                    }
                }
            }
        },{
            $sort: {
            liked_count: -1,
                date_Time: -1
        }
    }
    ], function (err, photos) {
            if (err) {
                console.error("Error in /photosOfUser/:id", err);
                response.status(500)
                    .send(JSON.stringify(err));
                return;
            }
            if (photos.length === 0) {
                response.status(400)
                    .send();
                return;
            }
            response.end(JSON.stringify(photos));
        });
    } else {
        response.status(401).send();
    }
});

/**
 * URL /commentsOfUser/:id - Returns the Comments for User (id).
 */
app.get("/commentsOfUser/:id", function (request, response) {
    if (request.session.login_name) {
        const id = request.params.id;
        let mongoTargetObj;
        try {
            mongoTargetObj = new mongoose.Types.ObjectId(id);
        } catch (e) {
            response.status(400).send();
        }

        Photo.aggregate([{
            $unwind: "$comments",
        }, {
            $project: {
                _id: "$comments._id",
                user_id: "$comments.user_id",
                photo_name: "$file_name",
                date_time: "$comments.date_time",
                text: "$comments.comment",
            },
        }, {
            $match: {
                user_id: mongoTargetObj
            },
        }], function (err, comments) {
            if (err) {
                console.error("Error in /commentsOfUser/:id", err);
                response.status(500)
                    .send(JSON.stringify(err));
                return;
            }
            if (comments.length === 0) {
                response.status(400)
                    .send();
                return;
            }
            response.end(JSON.stringify(comments));
        });
    } else {
        response.status(401).send();
    }
});

/**
 * URL /admin/login - Creates User Session and Returns Username
 */
app.post("/admin/login", (request, response) => {
    const {login_name, password} = request.body;
    User.aggregate([{
        $match: {
            login_name: login_name
        }
    },
    ], function (err, users) {
        const user = users[0];
        if (user && passwordFxns.doesPasswordMatch(user.password.hash, user.password.salt, password)) {
            request.session.login_name = login_name;
            request.session.user_id = user._id;
            logEvent("login");
            response.status(200).json({message: "Successful Login", user: user, _id: user._id});
        } else {
            response.status(400).json({message: "Invalid Login Information"});
        }
    });
});

/**
 * User /admin/logout - Clears Current Session
 */
app.post("/admin/logout", (request, response) => {
    if (request.session.login_name) {
        request.session.destroy();
        logEvent("logout");
        response.status(200).json({message: "Logout Successful"});
    } else {
        response.status(400).json({message: "No User Logged In"});
    }
});

/**
 * Post to /user - Registers a new user
 */
app.post("/user", (request, response) => {
    const {first_name, last_name, location, description, occupation, login_name, password} = request.body;
    // Check if any of the required fields are empty
    if (!login_name) {
        response.status(400).json({message: "Please enter username"});
        return;
    }
    if (!password || password === 'invalid password') {
        response.status(400).json({message: "Please enter password"});
        return;
    }
    if (!first_name) {
        response.status(400).json({message: "Please enter first name"});
        return;
    }
    if (!last_name) {
        response.status(400).json({message: "Please enter last name"});
        return;
    }

    // Check if the username already exists
    User.findOne({login_name}, (err, existingUser) => {
        if (err) {
            console.error("Error in /user", err);
            response.status(500).json({message: "Registration failed"});
            return;
        }

        if (existingUser) {
            response.status(400).json({message: "Username already exists"});
        } else {
            // Create a new user
            const newUser = new User({
                first_name, last_name, location, description, occupation, login_name, password
            });

            newUser.save((errUser, user) => {
                if (errUser) {
                    console.error("Error in /user", errUser);
                    response.status(500).json({message: "Registration failed"});
                    return;
                }

                request.session.login_name = login_name;
                logEvent("register");
                response.status(200).json({message: "Registration successful", user, login_name});
            });
        }
    });
});

/**
 * Post to /commentsOfPhoto/:photo_id - Adds a comment to a photo
 */
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (request.session.login_name) {
        const timestamp = new Date().valueOf();
        const id = new mongoose.Types.ObjectId(request.params.photo_id);
        const commentInput = request.body.comment;
        const commentBody = {
            comment: commentInput, date_time: timestamp, user_id: request.session.user_id
        };
        Photo.findById({
            _id: id
        }).then((photo) => {
            photo.comments = photo.comments.concat(commentBody);
            photo.save((err) => {
                if (err) {
                    console.error('/commentsOfPhoto/:photoId', err);
                    response.status(400).json({message: "Comment Upload Failed"});
                    return;
                }
                logEvent("comment", photo.file_name, request.session.login_name);
                response.status(200).json({message: "Comment Upload Success"});
            });
        });
    }
});

/**
*  Post to /photos/new - Adds a new photo
*/
app.post("/photos/new", (request, response) => {
    if (request.session.login_name) {

        processFormBody(request, response, function (err) {
            if (err || !request.file) {
                response.status(400)
                    .send(JSON.stringify(err));
                return;
            }

            // request.file has the following properties of interest:
            //   fieldname    - Should be 'uploadedphoto' since that is what we sent
            //   originalname - The name of the file the user uploaded
            //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
            //                  'image/png')
            //   buffer       - A node Buffer containing the contents of the file
            //   size         - The size of the file in bytes

            const timestamp = new Date().valueOf();
            const filename = 'U' + String(timestamp) + request.file.originalname;

            fs.writeFile("./images/" + filename, request.file.buffer, function (errWrite) {
                if (errWrite) {
                    console.log("Error Writing to file in /photos/new", errWrite);
                    return;
                }
                const newPhoto = new Photo({
                    file_name: filename, date_time: timestamp, user_id: request.session.user_id

                });
                newPhoto.save((errPhoto) => {
                    if (errPhoto) {
                        console.error("Error in /photos/new", errPhoto);
                        response.status(400).json({message: "Photo Upload Failed"});
                        return;
                    }
                    logEvent("photo", filename, request.session.login_name);
                    response.status(200).json({message: "Photo Upload Success"});
                });
            });
        });
    }
});

app.post("/favorite/:photo_id", (request, response) => {
    if (request.session.login_name) {
        const id = new mongoose.Types.ObjectId(request.params.photo_id);

        Photo.findById({
            _id: id
        }).then((photo) => {
            photo.favorite_by.push(request.session.user_id);
            photo.save((err) => {
                if (err) {
                    console.error('/favorite/:photo_id', err);
                    response.status(400).json({message: "Failed to Favorite Photo"});
                    return;
                }
                response.status(200).json({message: "Photo Favorited"});
            });
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});

app.delete("/favorite/:photo_id", (request, response) => {
    if (request.session.login_name) {
        const id = new mongoose.Types.ObjectId(request.params.photo_id);
        Photo.findById({
            _id: id
        }).then((photo) => {
            photo.favorite_by = photo.favorite_by.filter(item => item.toString() !== request.session.user_id.toString());
            photo.save((err) => {
                if (err) {
                    response.status(404).json({message: "Failed to find Photo"});
                    return;
                }
                response.status(204).send();
            });
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});

app.get("/favorites", (request, response) => {
    if (request.session.login_name) {
        let mongoTargetObj;
        try {
            mongoTargetObj = new mongoose.Types.ObjectId(request.session.user_id);
        } catch (e) {
            response.status(400).send();
        }

        Photo.aggregate([{
            $match: {
                favorite_by: mongoTargetObj
            }
        }], function (err, photos) {
            if (err) {
                console.error("Error in /favorites", err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            response.end(JSON.stringify(photos));
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});

// Serve 5 most recent activities
app.get("/activity", (request, response) => {
    if (request.session.login_name) {
        ActivityEvent.aggregate([
            { $sort: { date_time: -1 } },
            { $limit: 5 }
        ], function (err, activityEvents) {
            if (err) {
                console.error("Error in /activity", err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            response.end(JSON.stringify(activityEvents));
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});
app.post("/like/:photo_id", (request, response) => {
    if (request.session.login_name) {
        const id = new mongoose.Types.ObjectId(request.params.photo_id);

        Photo.findById({
            _id: id
        }).then((photo) => {
            photo.liked_by.push(request.session.user_id);
            photo.save((err) => {
                if (err) {
                    console.error('/like/:photo_id', err);
                    response.status(400).json({message: "Failed to Like Photo"});
                    return;
                }
                response.status(200).json({message: "Photo Liked"});
            });
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});

app.delete("/like/:photo_id", (request, response) => {
    if (request.session.login_name) {
        const id = new mongoose.Types.ObjectId(request.params.photo_id);
        Photo.findById({
            _id: id
        }).then((photo) => {
            photo.liked_by = photo.liked_by.filter(item => item.toString() !== request.session.user_id.toString());
            photo.save((err) => {
                if (err) {
                    response.status(404).json({message: "Failed to Like Photo"});
                    return;
                }
                response.status(204).send();
            });
        });
    } else {
        response.status(401).json({message: "No User Logged In"});
    }
});
const server = app.listen(3000, function () {
    const port = server.address().port;
    console.log("Listening at http://localhost:" + port + " exporting the directory " + __dirname);
});

