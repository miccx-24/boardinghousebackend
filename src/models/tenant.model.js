const { Schema, model } = require("mongoose");

const tenantSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Tenant", tenantSchema);
