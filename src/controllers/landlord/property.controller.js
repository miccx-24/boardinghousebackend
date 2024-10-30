const { Property } = require('../../models/property.model');

const propertyController = {
    createProperty: async (req, res) => {
        try {
            const { address, propertyType, amenities } = req.body;
            
            const property = new Property({
                landlord: req.user._id,
                address,
                propertyType,
                amenities: amenities || []
            });

            await property.save();
            res.status(201).json({
                message: 'Property created successfully',
                property
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error creating property',
                error: error.message
            });
        }
    },

    getProperties: async (req, res) => {
        try {
            const properties = await Property.find({ landlord: req.user._id });
            res.status(200).json(properties);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching properties',
                error: error.message
            });
        }
    }
};

module.exports = propertyController; 