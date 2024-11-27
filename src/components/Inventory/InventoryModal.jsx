import React, { useState, useCallback, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { inventoryService } from '../../firebase/services/inventoryService';
import imageCompression from 'browser-image-compression';
import FormField from '../FormFields/FormField';
import './InventoryModal.css';
import { useAuth } from '../../contexts/AuthContext';
import { s3 } from '../../firebase/awsConfig'; // Ensure this is correctly set up


const EQUIPMENT_CATEGORIES = {
    TRUCK: 'truck',
    TRAILER: 'trailer'
};

const TRAILER_TYPES = {
    DRY_VAN: 'dry_van',
    REEFER: 'reefer'
};

const EQUIPMENT_PRESETS = {
    TRUCK_MAKES: [
        'Freightliner',
        'Kenworth',
        'Peterbilt',
        'Volvo',
        'International',
        'Mack',
        'Western Star'
    ],
    
    TRAILER_MAKES: [
        'Great Dane',
        'Utility',
        'Wabash',
        'Hyundai',
        'Stoughton',
        'Vanguard'
    ],

    ENGINE_TYPES: [
        'Cummins X15',
        'Detroit DD15',
        'PACCAR MX-13',
        'Volvo D13',
        'Mack MP8'
    ],

    TRANSMISSION_TYPES: [
        'Manual 10-Speed',
        'Manual 13-Speed',
        'Manual 18-Speed',
        'Automatic',
        'Automated Manual'
    ],

    TIRE_TREAD_OPTIONS: [
        'New (95-100%)',
        'Excellent (75-95%)',
        'Good (50-75%)',
        'Fair (25-50%)',
        'Poor (< 25%)',
        'Needs Replacement'
    ],

    WARRANTY_OPTIONS: [
        'Full Factory Warranty',
        'Partial Warranty',
        'Extended Warranty',
        'No Warranty',
        'Transferable Warranty'
    ],

    FUEL_TANK_SIZES: [
        '100 gallons',
        '120 gallons',
        '150 gallons',
        '200 gallons',
        '250 gallons',
        'Other'
    ],

    DOOR_TYPE: [
        'Roll Up',
        'Swing',
        'Side Door'
    ],

    SUSPENSION_TYPE: [
        'Air Ride',
        'Spring',
        'Other'
    ]
};

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 150 * 1024; // 150KB
const MAX_DOCUMENTS = 20;

const TOOLTIPS = {
    year: 'Enter the manufacturing year',
    vin: 'Vehicle Identification Number (17 characters)',
    price: 'Enter the asking price',
    mileage: 'Current odometer reading',
    engine: 'Engine specifications',
    transmission: 'Transmission type',
    hours: 'Engine hours for reefer units',
    apu: 'Auxiliary Power Unit status',
    inverter: 'Power inverter status',
    bunkHeater: 'Bunk heater status',
    deerGuard: 'Deer guard status',
    fuelTankSize: 'Total fuel capacity',
    steerTireTread: 'Tread condition of steering axle tires',
    driveTireTread: 'Tread condition of drive axle tires',
    trailerTireTread: 'Tread condition of trailer tires',
    warranty: 'Current warranty status',
    warrantyExpTime: 'Number of months remaining on warranty',
    warrantyExpMiles: 'Miles remaining on warranty'
};

const INITIAL_FORM_STATE = {
    category: EQUIPMENT_CATEGORIES.TRUCK,
    year: '',
    make: '',
    model: '',
    vin: '',
    price: '',
    mileage: '',
    description: '',
    
    // Truck specific fields
    apu: 'no',
    inverter: 'no',
    bunkHeater: 'no',
    deerGuard: 'no',
    fuelTankSize: '',

    // Trailer specific fields
    trailerType: TRAILER_TYPES.DRY_VAN,
    doorType: '',
    suspension: '',
    airLines: 'no',
    
    // Reefer specific fields
    reeferHours: '',
    reeferMake: ''
};

const VALIDATION_RULES = {
    vin: {
        pattern: /^[A-HJ-NPR-Z0-9]{17}$/,
        message: 'VIN must be 17 characters (excluding I, O, and Q)'
    },
    year: {
        min: 1990,
        max: new Date().getFullYear() + 1,
        message: `Year must be between 1990 and ${new Date().getFullYear() + 1}`
    },
    price: {
        min: 0,
        message: 'Price must be greater than 0'
    },
    mileage: {
        min: 0,
        message: 'Mileage must be greater than 0'
    }
};

const InventoryModal = ({ onClose, sellerId, onSave }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);

    useEffect(() => {
        console.log('InventoryModal Auth State:', {
            isAuthenticated: !!currentUser,
            sellerId,
            userDetails: currentUser ? {
                uid: currentUser.uid,
                email: currentUser.email
            } : 'Not authenticated'
        });

        if (!sellerId) {
            console.error('No seller ID provided');
            onClose();
            return;
        }
    }, [currentUser, sellerId]);

    const validateField = useCallback((name, value) => {
        if (!value && name !== 'description') {
            return 'This field is required';
        }

        switch (name) {
            case 'vin':
                if (!VALIDATION_RULES.vin.pattern.test(value)) {
                    return VALIDATION_RULES.vin.message;
                }
                break;
            case 'year':
                const yearNum = parseInt(value);
                if (yearNum < VALIDATION_RULES.year.min || 
                    yearNum > VALIDATION_RULES.year.max) {
                    return VALIDATION_RULES.year.message;
                }
                break;
            case 'price':
                if (parseFloat(value) <= VALIDATION_RULES.price.min) {
                    return VALIDATION_RULES.price.message;
                }
                break;
            case 'mileage':
                if (parseFloat(value) < VALIDATION_RULES.mileage.min) {
                    return VALIDATION_RULES.mileage.message;
                }
                break;
            default:
                break;
        }
        return '';
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, [validateField]);

    const handleCategoryChange = useCallback((e) => {
        const newCategory = e.target.value;
        setFormData(prev => ({
            ...INITIAL_FORM_STATE,
            category: newCategory,
            images: prev.images
        }));
        setErrors({});
    }, []);

    const renderFormFields = () => {
        const commonFields = (
            <>
                <div className="form-row">
                    <FormField
                        label="Year"
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        error={errors.year}
                        tooltip={TOOLTIPS.year}
                        required
                    />
                    <FormField
                        label="Make"
                        type="select"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        error={errors.make}
                        options={formData.category === EQUIPMENT_CATEGORIES.TRUCK ? 
                            EQUIPMENT_PRESETS.TRUCK_MAKES.map(make => ({ value: make, label: make })) : 
                            EQUIPMENT_PRESETS.TRAILER_MAKES.map(make => ({ value: make, label: make }))}
                        required
                    />
                </div>

                <div className="form-row">
                    <FormField
                        label="Model"
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        error={errors.model}
                        required
                    />
                    <FormField
                        label="VIN"
                        type="text"
                        name="vin"
                        value={formData.vin}
                        onChange={handleInputChange}
                        error={errors.vin}
                        tooltip={TOOLTIPS.vin}
                        required
                    />
                </div>

                <div className="form-section">
                    <h3>Warranty Information</h3>
                    <div className="form-row">
                        <FormField
                            label="Warranty Status"
                            type="select"
                            name="warranty"
                            value={formData.warranty}
                            onChange={handleInputChange}
                            error={errors.warranty}
                            tooltip={TOOLTIPS.warranty}
                            options={EQUIPMENT_PRESETS.WARRANTY_OPTIONS.map(warranty => ({
                                value: warranty,
                                label: warranty
                            }))}
                            required
                        />
                    </div>

                    {formData.warranty !== 'No Warranty' && (
                        <div className="warranty-details">
                            <div className="form-row">
                                <FormField
                                    label="Warranty Months Remaining"
                                    type="number"
                                    name="warrantyExpTime"
                                    value={formData.warrantyExpTime}
                                    onChange={handleInputChange}
                                    error={errors.warrantyExpTime}
                                    tooltip={TOOLTIPS.warrantyExpTime}
                                    min="0"
                                    max="120"
                                    required
                                />
                                <FormField
                                    label="Warranty Miles Remaining"
                                    type="number"
                                    name="warrantyExpMiles"
                                    value={formData.warrantyExpMiles}
                                    onChange={handleInputChange}
                                    error={errors.warrantyExpMiles}
                                    tooltip={TOOLTIPS.warrantyExpMiles}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>
            </>
        );

        if (formData.category === EQUIPMENT_CATEGORIES.TRAILER) {
            return (
                <>
                    {commonFields}
                    <div className="form-row">
                        <FormField
                            label="Trailer Type"
                            type="select"
                            name="trailerType"
                            value={formData.trailerType}
                            onChange={handleInputChange}
                            error={errors.trailerType}
                            options={[
                                { value: TRAILER_TYPES.DRY_VAN, label: 'Dry Van' },
                                { value: TRAILER_TYPES.REEFER, label: 'Reefer' }
                            ]}
                            required
                        />
                        {formData.trailerType === TRAILER_TYPES.REEFER && (
                            <FormField
                                label="Hours"
                                type="number"
                                name="hours"
                                value={formData.hours}
                                onChange={handleInputChange}
                                error={errors.hours}
                                tooltip={TOOLTIPS.hours}
                            />
                        )}
                    </div>

                    <div className="form-section">
                        <h3>Tire Information</h3>
                        <FormField
                            label="Trailer Tire Tread"
                            type="select"
                            name="trailerTireTread"
                            value={formData.trailerTireTread}
                            onChange={handleInputChange}
                            error={errors.trailerTireTread}
                            options={EQUIPMENT_PRESETS.TIRE_TREAD_OPTIONS.map(tread => ({
                                value: tread,
                                label: tread
                            }))}
                            tooltip={TOOLTIPS.trailerTireTread}
                            required
                        />
                    </div>
                </>
            );
        }

        if (formData.category === EQUIPMENT_CATEGORIES.TRUCK) {
            return (
                <>
                    {commonFields}
                    <div className="form-row">
                        <FormField
                            label="Mileage"
                            type="number"
                            name="mileage"
                            value={formData.mileage}
                            onChange={handleInputChange}
                            error={errors.mileage}
                            tooltip={TOOLTIPS.mileage}
                            required
                        />
                        <FormField
                            label="Engine"
                            type="select"
                            name="engine"
                            value={formData.engine}
                            onChange={handleInputChange}
                            error={errors.engine}
                            options={EQUIPMENT_PRESETS.ENGINE_TYPES.map(engine => ({
                                value: engine,
                                label: engine
                            }))}
                            tooltip={TOOLTIPS.engine}
                            required
                        />
                    </div>

                    <FormField
                        label="Transmission"
                        type="select"
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        error={errors.transmission}
                        options={EQUIPMENT_PRESETS.TRANSMISSION_TYPES.map(transmission => ({
                            value: transmission,
                            label: transmission
                        }))}
                        tooltip={TOOLTIPS.transmission}
                        required
                    />

                    <div className="form-row">
                        <FormField
                            label="Fuel Tank Size"
                            type="select"
                            name="fuelTankSize"
                            value={formData.fuelTankSize}
                            onChange={handleInputChange}
                            error={errors.fuelTankSize}
                            options={EQUIPMENT_PRESETS.FUEL_TANK_SIZES.map(size => ({
                                value: size,
                                label: size
                            }))}
                            tooltip={TOOLTIPS.fuelTankSize}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <div className="truck-features">
                            <div className="feature-group">
                                <label className="feature-label">APU</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="apu"
                                            value="yes"
                                            checked={formData.apu === 'yes'}
                                            onChange={handleInputChange}
                                        /> Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="apu"
                                            value="no"
                                            checked={formData.apu === 'no'}
                                            onChange={handleInputChange}
                                        /> No
                                    </label>
                                </div>
                            </div>

                            <div className="feature-group">
                                <label className="feature-label">Inverter</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="inverter"
                                            value="yes"
                                            checked={formData.inverter === 'yes'}
                                            onChange={handleInputChange}
                                        /> Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="inverter"
                                            value="no"
                                            checked={formData.inverter === 'no'}
                                            onChange={handleInputChange}
                                        /> No
                                    </label>
                                </div>
                            </div>

                            <div className="feature-group">
                                <label className="feature-label">Bunk Heater</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="bunkHeater"
                                            value="yes"
                                            checked={formData.bunkHeater === 'yes'}
                                            onChange={handleInputChange}
                                        /> Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="bunkHeater"
                                            value="no"
                                            checked={formData.bunkHeater === 'no'}
                                            onChange={handleInputChange}
                                        /> No
                                    </label>
                                </div>
                            </div>

                            <div className="feature-group">
                                <label className="feature-label">Deer Guard</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="deerGuard"
                                            value="yes"
                                            checked={formData.deerGuard === 'yes'}
                                            onChange={handleInputChange}
                                        /> Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="deerGuard"
                                            value="no"
                                            checked={formData.deerGuard === 'no'}
                                            onChange={handleInputChange}
                                        /> No
                                    </label>
                                </div>
                            </div>

                            <div className="feature-group">
                                <FormField
                                    label="Fuel Tank Size"
                                    type="select"
                                    name="fuelTankSize"
                                    value={formData.fuelTankSize}
                                    onChange={handleInputChange}
                                    options={EQUIPMENT_PRESETS.FUEL_TANK_SIZES}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Tire Information</h3>
                        <div className="form-row">
                            <FormField
                                label="Steer Tire Tread"
                                type="select"
                                name="steerTireTread"
                                value={formData.steerTireTread}
                                onChange={handleInputChange}
                                error={errors.steerTireTread}
                                options={EQUIPMENT_PRESETS.TIRE_TREAD_OPTIONS.map(tread => ({
                                    value: tread,
                                    label: tread
                                }))}
                                tooltip={TOOLTIPS.steerTireTread}
                                required
                            />
                            <FormField
                                label="Drive Tire Tread"
                                type="select"
                                name="driveTireTread"
                                value={formData.driveTireTread}
                                onChange={handleInputChange}
                                error={errors.driveTireTread}
                                options={EQUIPMENT_PRESETS.TIRE_TREAD_OPTIONS.map(tread => ({
                                    value: tread,
                                    label: tread
                                }))}
                                tooltip={TOOLTIPS.driveTireTread}
                                required
                            />
                        </div>
                    </div>
                </>
            );
        }

        return (
            <>
                {commonFields}
                <div className="form-row">
                    <FormField
                        label="Mileage"
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        error={errors.mileage}
                        tooltip={TOOLTIPS.mileage}
                    />
                    <FormField
                        label="Engine"
                        type="select"
                        name="engine"
                        value={formData.engine}
                        onChange={handleInputChange}
                        error={errors.engine}
                        options={EQUIPMENT_PRESETS.ENGINE_TYPES.map(engine => ({
                            value: engine,
                            label: engine
                        }))}
                        tooltip={TOOLTIPS.engine}
                    />
                </div>
                <FormField
                    label="Transmission"
                    type="select"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    error={errors.transmission}
                    options={EQUIPMENT_PRESETS.TRANSMISSION_TYPES.map(transmission => ({
                        value: transmission,
                        label: transmission
                    }))}
                    tooltip={TOOLTIPS.transmission}
                />
            </>
        );
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        
        if (previewImages.length + files.length > MAX_IMAGES) {
            setErrors(prev => ({
                ...prev,
                images: `Maximum ${MAX_IMAGES} images allowed`
            }));
            return;
        }

        setLoading(true);
        try {
            const processedFiles = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.name}`;
                const params = {
                    Bucket: import.meta.env.VITE_AWS_BUCKET_NAME, // Use Vite's environment variable syntax
                    Key: fileName,
                    Body: file,
                    ContentType: file.type,
                };

                // Upload the file to S3
                await s3.putObject(params); // Use putObject for v3

                // Create a preview URL
                const previewUrl = URL.createObjectURL(file);
                return {
                    file: file,
                    preview: previewUrl,
                    url: `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}` // S3 URL
                };
            }));

            setPreviewImages(prev => [...prev, ...processedFiles]);
            setErrors(prev => ({ ...prev, images: '' }));
        } catch (error) {
            console.error('Error uploading images:', error);
            setErrors(prev => ({
                ...prev,
                images: 'Error uploading images. Please try again.'
            }));
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index) => {
        setPreviewImages(prev => {
            const newImages = [...prev];
            // Revoke the URL to prevent memory leaks
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const validateForm = useCallback(() => {
        const newErrors = {};
        
        // Basic field validation
        const requiredFields = ['category', 'year', 'make', 'model', 'vin', 'price'];
        
        // Add category-specific required fields
        if (formData.category === EQUIPMENT_CATEGORIES.TRUCK) {
            requiredFields.push('mileage', 'fuelTankSize');
        } else if (formData.category === EQUIPMENT_CATEGORIES.TRAILER) {
            requiredFields.push('doorType', 'suspension');
            if (formData.trailerType === TRAILER_TYPES.REEFER) {
                requiredFields.push('reeferHours', 'reeferMake');
            }
        }

        // Check required fields
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        // Validate VIN
        if (formData.vin && !VALIDATION_RULES.vin.pattern.test(formData.vin)) {
            newErrors.vin = VALIDATION_RULES.vin.message;
        }

        // Validate year
        const yearNum = parseInt(formData.year);
        if (yearNum < VALIDATION_RULES.year.min || yearNum > VALIDATION_RULES.year.max) {
            newErrors.year = VALIDATION_RULES.year.message;
        }

        // Validate price
        if (parseFloat(formData.price) <= VALIDATION_RULES.price.min) {
            newErrors.price = VALIDATION_RULES.price.message;
        }

        // Validate mileage for trucks only
        if (formData.category === EQUIPMENT_CATEGORIES.TRUCK) {
            if (parseFloat(formData.mileage) < VALIDATION_RULES.mileage.min) {
                newErrors.mileage = VALIDATION_RULES.mileage.message;
            }
        }

        // Validate images
        if (previewImages.length === 0) {
            newErrors.images = 'At least one image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, previewImages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (!currentUser) {
                throw new Error('User must be authenticated to add inventory');
            }

            const inventoryData = {
                ...formData,
                images: previewImages,
                documents: uploadedDocuments,
                sellerId,
                userId: currentUser.uid,
                category: formData.category,
                make: formData.make,
                model: formData.model,
                year: parseInt(formData.year),
                price: parseFloat(formData.price),
                status: 'available',
                mileage: parseInt(formData.mileage)
            };

            await inventoryService.addInventory(sellerId, inventoryData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ submit: 'Failed to save inventory. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Clean up URLs when component unmounts
    useEffect(() => {
        return () => {
            previewImages.forEach(image => {
                URL.revokeObjectURL(image.preview);
            });
        };
    }, [previewImages]);

    const handleDocumentUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (uploadedDocuments.length + files.length > MAX_DOCUMENTS) {
            setErrors(prev => ({
                ...prev,
                documents: `Maximum ${MAX_DOCUMENTS} documents allowed`
            }));
            return;
        }

        setLoading(true);
        try {
            const processedFiles = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.name}`;
                const params = {
                    Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: file,
                    ContentType: file.type,
                };

                // Upload the file to S3
                await s3.putObject(params); // Use putObject for v3

                // Create a document URL
                const documentUrl = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`; // S3 URL
                return {
                    url: documentUrl,
                    name: file.name // Store the file name for display
                };
            }));

            setUploadedDocuments(prev => [...prev, ...processedFiles]);
            setErrors(prev => ({ ...prev, documents: '' }));
        } catch (error) {
            console.error('Error uploading documents:', error);
            setErrors(prev => ({
                ...prev,
                documents: 'Error uploading documents. Please try again.'
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>Add Inventory</h2>
                        <button type="button" className="close-button" onClick={onClose}>
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-section">
                            <div className="form-row">
                                <FormField
                                    label="Equipment Category"
                                    type="select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    options={[
                                        { value: EQUIPMENT_CATEGORIES.TRUCK, label: 'Truck' },
                                        { value: EQUIPMENT_CATEGORIES.TRAILER, label: 'Trailer' }
                                    ]}
                                    required
                                />
                                
                                {formData.category === EQUIPMENT_CATEGORIES.TRAILER ? (
                                    <FormField
                                        label="Trailer Type"
                                        type="select"
                                        name="trailerType"
                                        value={formData.trailerType}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: TRAILER_TYPES.DRY_VAN, label: 'Dry Van' },
                                            { value: TRAILER_TYPES.REEFER, label: 'Reefer' }
                                        ]}
                                        required
                                    />
                                ) : (
                                    <FormField
                                        label="Year"
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        error={errors.year}
                                        required
                                    />
                                )}
                            </div>

                            {formData.category === EQUIPMENT_CATEGORIES.TRAILER && (
                                <div className="form-row">
                                    <FormField
                                        label="Year"
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        error={errors.year}
                                        required
                                    />
                                    <div className="form-field"></div> {/* Empty div for grid alignment */}
                                </div>
                            )}

                            <div className="form-row">
                                <FormField
                                    label="Make"
                                    type="select"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    options={formData.category === EQUIPMENT_CATEGORIES.TRUCK ? 
                                        EQUIPMENT_PRESETS.TRUCK_MAKES : EQUIPMENT_PRESETS.TRAILER_MAKES}
                                    required
                                />
                                <FormField
                                    label="Model"
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <FormField
                                    label="VIN"
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formData.category === EQUIPMENT_CATEGORIES.TRUCK && (
                                    <FormField
                                        label="Mileage"
                                        type="number"
                                        name="mileage"
                                        value={formData.mileage}
                                        onChange={handleInputChange}
                                        error={errors.mileage}
                                        tooltip={TOOLTIPS.mileage}
                                        required
                                    />
                                )}
                            </div>

                            <div className="form-row">
                                <FormField
                                    label="Price"
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="form-field"></div>
                            </div>
                        </div>

                        {formData.category === EQUIPMENT_CATEGORIES.TRUCK && (
                            <div className="form-section">
                                <div className="truck-features">
                                    <div className="feature-group">
                                        <label className="feature-label">APU</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="apu"
                                                    value="yes"
                                                    checked={formData.apu === 'yes'}
                                                    onChange={handleInputChange}
                                                /> Yes
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="apu"
                                                    value="no"
                                                    checked={formData.apu === 'no'}
                                                    onChange={handleInputChange}
                                                /> No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="feature-group">
                                        <label className="feature-label">Inverter</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="inverter"
                                                    value="yes"
                                                    checked={formData.inverter === 'yes'}
                                                    onChange={handleInputChange}
                                                /> Yes
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="inverter"
                                                    value="no"
                                                    checked={formData.inverter === 'no'}
                                                    onChange={handleInputChange}
                                                /> No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="feature-group">
                                        <label className="feature-label">Bunk Heater</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="bunkHeater"
                                                    value="yes"
                                                    checked={formData.bunkHeater === 'yes'}
                                                    onChange={handleInputChange}
                                                /> Yes
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="bunkHeater"
                                                    value="no"
                                                    checked={formData.bunkHeater === 'no'}
                                                    onChange={handleInputChange}
                                                /> No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="feature-group">
                                        <label className="feature-label">Deer Guard</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="deerGuard"
                                                    value="yes"
                                                    checked={formData.deerGuard === 'yes'}
                                                    onChange={handleInputChange}
                                                /> Yes
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="deerGuard"
                                                    value="no"
                                                    checked={formData.deerGuard === 'no'}
                                                    onChange={handleInputChange}
                                                /> No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="feature-group">
                                        <FormField
                                            label="Fuel Tank Size"
                                            type="select"
                                            name="fuelTankSize"
                                            value={formData.fuelTankSize}
                                            onChange={handleInputChange}
                                            options={EQUIPMENT_PRESETS.FUEL_TANK_SIZES}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.category === EQUIPMENT_CATEGORIES.TRAILER && (
                            <div className="form-section">
                                <h3>Trailer Features</h3>
                                <div className="trailer-features">
                                    <div className="feature-group">
                                        <FormField
                                            label="Door Type"
                                            type="select"
                                            name="doorType"
                                            value={formData.doorType}
                                            onChange={handleInputChange}
                                            options={EQUIPMENT_PRESETS.DOOR_TYPE}
                                            required
                                        />
                                    </div>

                                    <div className="feature-group">
                                        <FormField
                                            label="Suspension"
                                            type="select"
                                            name="suspension"
                                            value={formData.suspension}
                                            onChange={handleInputChange}
                                            options={EQUIPMENT_PRESETS.SUSPENSION_TYPE}
                                            required
                                        />
                                    </div>

                                    {formData.trailerType === TRAILER_TYPES.REEFER && (
                                        <>
                                            <div className="feature-group">
                                                <FormField
                                                    label="Reefer Unit Hours"
                                                    type="number"
                                                    name="reeferHours"
                                                    value={formData.reeferHours}
                                                    onChange={handleInputChange}
                                                    tooltip="Operating hours of the reefer unit"
                                                    required
                                                />
                                            </div>
                                            <div className="feature-group">
                                                <FormField
                                                    label="Reefer Unit Make"
                                                    type="text"
                                                    name="reeferMake"
                                                    value={formData.reeferMake}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="feature-group">
                                        <label className="feature-label">Air Lines</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="airLines"
                                                    value="yes"
                                                    checked={formData.airLines === 'yes'}
                                                    onChange={handleInputChange}
                                                /> Yes
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="airLines"
                                                    value="no"
                                                    checked={formData.airLines === 'no'}
                                                    onChange={handleInputChange}
                                                /> No
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-section">
                            <div className="form-row">
                                <FormField
                                    className="full-width"
                                    label="Description"
                                    type="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-section image-section">
                            <h3>Images</h3>
                            <div className="image-upload-container">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    id="image-upload"
                                    hidden
                                    disabled={previewImages.length >= MAX_IMAGES}
                                />
                                <label 
                                    htmlFor="image-upload" 
                                    className={`upload-button ${loading ? 'loading' : ''} ${previewImages.length >= MAX_IMAGES ? 'disabled' : ''}`}
                                >
                                    <PhotoIcon className="h-6 w-6" />
                                    {previewImages.length >= MAX_IMAGES 
                                        ? 'Maximum images reached'
                                        : `Upload Images (${previewImages.length}/${MAX_IMAGES})`
                                    }
                                </label>

                                {errors.images && (
                                    <div className="error-message">{errors.images}</div>
                                )}

                                <div className="image-preview-grid">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={image.preview} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-image"
                                                onClick={() => removeImage(index)}
                                                title="Remove image"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                            {index === 0 && (
                                                <span className="primary-badge">Primary</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-section document-section">
                            <h3>Documents</h3>
                            <div className="document-upload-container">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    onChange={handleDocumentUpload}
                                    id="document-upload"
                                    hidden
                                    disabled={uploadedDocuments.length >= MAX_DOCUMENTS}
                                />
                                <label 
                                    htmlFor="document-upload" 
                                    className={`upload-button ${loading ? 'loading' : ''} ${uploadedDocuments.length >= MAX_DOCUMENTS ? 'disabled' : ''}`}
                                >
                                    Upload Documents ({uploadedDocuments.length}/{MAX_DOCUMENTS})
                                </label>

                                {errors.documents && (
                                    <div className="error-message">{errors.documents}</div>
                                )}

                                <div className="document-preview-grid">
                                    {uploadedDocuments.map((doc, index) => (
                                        <div key={index} className="document-preview">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                                            <button onClick={() => removeDocument(index)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Inventory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryModal; 