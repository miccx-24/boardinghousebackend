const { Schema, model } = require("mongoose");

const leaseSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Lease", leaseSchema);
