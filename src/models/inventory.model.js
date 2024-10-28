const { Schema, model } = require("mongoose");

const inventorySchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Inventory", inventorySchema);
    