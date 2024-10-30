const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async createInvoice({ customerId, amount, description, dueDate }) {
    try {
      // Create invoice item first
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description: description
      });

      // Create invoice
      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice',
        due_date: Math.floor(dueDate.getTime() / 1000) // Convert to Unix timestamp
      });

      // Finalize the invoice
      await stripe.invoices.finalizeInvoice(invoice.id);

      return invoice;
    } catch (error) {
      throw new Error(`Error creating Stripe invoice: ${error.message}`);
    }
  },

  async retrieveInvoice(invoiceId) {
    try {
      return await stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      throw new Error(`Error retrieving Stripe invoice: ${error.message}`);
    }
  }
}; 