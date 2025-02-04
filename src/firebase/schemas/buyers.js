// Simplified buyer schema
const buyerSchema = {
    // Basic Information
    businessName: {
        type: 'string',
        required: true,
        maxLength: 100
    },
    contactName: {
        type: 'string',
        required: true,
        maxLength: 100
    },
    email: {
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        type: 'string',
        required: true,
        pattern: /^\d{10}$/
    },
    // Address Information
    address: {
        type: 'string',
        required: true,
        maxLength: 200
    },
    city: {
        type: 'string',
        required: true,
        maxLength: 100
    },
    state: {
        type: 'string',
        required: true,
        length: 2
    },
    zip: {
        type: 'string',
        required: true,
        pattern: /^\d{5}(-\d{4})?$/
    },
    // Business Information
    businessType: {
        type: 'string',
        required: true,
        enum: ['company', 'individual', 'partnership']
    },
    ein: {
        type: 'string',
        required: false,
        pattern: /^\d{2}-\d{7}$/
    },
    ssn: {
        type: 'string',
        required: false,
        pattern: /^\d{3}-\d{2}-\d{4}$/
    },
    // Driver Information
    cdlNumber: {
        type: 'string',
        required: false
    },
    cdlState: {
        type: 'string',
        required: false,
        length: 2
    },
    yearsDriving: {
        type: 'number',
        required: false,
        min: 0
    },
    yearsOwner: {
        type: 'number',
        required: false,
        min: 0
    },
    // Fleet Information
    fleetSize: {
        type: 'number',
        required: false,
        min: 0
    },
    trucksInFleet: {
        type: 'number',
        required: false,
        min: 0
    },
    trailersInFleet: {
        type: 'number',
        required: false,
        min: 0
    },
    // System Fields
    createdAt: {
        type: 'timestamp',
        required: true
    },
    updatedAt: {
        type: 'timestamp',
        required: true
    },
    status: {
        type: 'string',
        required: true,
        enum: ['active', 'inactive', 'pending', 'deleted']
    }
};

export default buyerSchema; 