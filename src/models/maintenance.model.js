const { Schema, model } = require("mongoose");

const maintenanceSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Maintenance", maintenanceSchema);
