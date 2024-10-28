const { Schema, model } = require("mongoose");

const paymentSchema = new Schema({
    name: { type: String, required: true },
});

module.exports = model("Payment", paymentSchema);
