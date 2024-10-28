const { Schema, model } = require("mongoose");

const landlordSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Landlord", landlordSchema);
