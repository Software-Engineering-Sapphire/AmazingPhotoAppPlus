const mongoose = require("mongoose");

// Create the structure for actionSchema
const activityEventSchema = new mongoose.Schema({
    date_time: { type: Date, default: Date.now },
    type: String,
    photo_filename: String,
    user: String,
});


// Create the Mongoose Model using actionSchema
const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);

module.exports = ActivityEvent;