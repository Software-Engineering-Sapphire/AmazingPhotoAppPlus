const mongoose = require("mongoose");
const Photo = require("Photo");

// Create the structure for actionSchema
const actionSchema = new mongoose.Schema({
    date_time: { type: Date, default: Date.now },
    actionType: String,
    photo: Photo,
});


// Create the Mongoose Model using actionSchema
const Action = mongoose.model("Action", actionSchema);

module.exports = Action;