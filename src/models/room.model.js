const { Schema, model } = require("mongoose");

const roomSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Room", roomSchema);
