// Simplified seller schema
const sellerSchema = {
    businessName: {
        type: 'string',
        required: true,
        maxLength: 100
    },
    businessType: {
        type: 'string',
        required: true,
        enum: ['company', 'individual', 'partnership']
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
    preferredContactMethod: {
        type: 'string',
        required: true,
        enum: ['email', 'phone', 'text']
    },
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
        enum: ['active', 'inactive', 'pending']
    }
}; 