const { Schema, model } = require("mongoose");

const communicationSchema = new Schema({
    email: { type: String, required: true },
});

module.exports = model("Communication", communicationSchema);
    