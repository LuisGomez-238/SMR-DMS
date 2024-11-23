import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

// Define the path to your PDF template for the seller form
const pdfTemplates = {
    SellerForms: '/pdfs/SellerForms.pdf',
    POASellerToSlate: '/pdfs/POASellerToSlate.pdf',
    ConsignmentForm: '/pdfs/ConsignmentForm.pdf',
    GuaranteeOfTitle: '/pdfs/GuaranteeOfTitle.pdf',
    POASellerToSPP: '/pdfs/POASellerToSPP.pdf'
};

const Seller = () => {
    const [formData, setFormData] = useState({
        sellerName: '',
        sellerCompanyName: '',
        sellerAddress: '',
        sellerCity: '',
        sellerState:'',
        sellerZip: '',
        sellerPhone: '',
        sellerEmail: '',
        sellerCDLNumber: '',
        sellerCDLState: '',
        stockNumber: '',
        date: new Date(),
        // Asset details
        assetYear: '',
        assetMake: '',
        assetModel: '',
        VIN: '',
        assetMiles: '',
        assetHours: '',
        assetEngine: '',
        assetEngineSerial: '',
        assetFuelTank: '',
        assetTransmission: '',
        assetSuspension: '',
        assetTireSize: '',
        assetWheelType: '',
        assetSleeper: '',
        assetDoubleBunk: '',
        assetInteriorColor: '',
        assetExteriorColor: '',
        assetExteriorOptions: '',
        salePrice: '',
        lienholderName: '',
        lienholderAddress: '',
        lienholderCityStateZip: '',
        lienholderPhoneNumber: '',
        payOff: '',
        payOffExpiration: '',
    });

    const [selectedTemplate, setSelectedTemplate] = useState('SellerForms');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDateChange = (date) => {
        setFormData((prevData) => ({
            ...prevData,
            dateReceived: date,
        }));
    };

    const handleTemplateChange = (e) => {
        setSelectedTemplate(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fillPdfWithFormFields(formData, selectedTemplate);
    };

    const loadPdf = async (template) => {
        const response = await fetch(pdfTemplates[template]);
        return await response.arrayBuffer();
    };

    const fillPdfWithFormFields = async (formData, template) => {
        try {
            const pdfBytes = await loadPdf(template);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();

            const setFieldText = (fieldName, value) => {
                try {
                    const field = form.getTextField(fieldName);
                    field.setText(value);
                } catch (error) {
                    console.warn(`Field "${fieldName}" does not exist: ${error.message}`);
                }
            };

            // Fill in the PDF form fields with seller and asset details
            setFieldText('sellerName', formData.sellerName);
            setFieldText('sellerCompanyName', formData.sellerCompanyName);
            setFieldText('sellerAddress', formData.sellerAddress);
            setFieldText('sellerCity', formData.sellerCity);
            setFieldText('sellerState', formData.sellerState);
            setFieldText('sellerZip', formData.sellerZip);
            setFieldText('sellerPhone', formData.sellerPhone);
            setFieldText('sellerEmail', formData.sellerEmail);
            setFieldText('sellerCDLNumber', formData.sellerCDLNumber);
            setFieldText('sellerCDLState', formData.sellerCDLState);
            setFieldText('stockNumber', formData.stockNumber);
            setFieldText('date', format(formData.dateReceived, 'MM/dd/yy'));

            // Asset details
            setFieldText('assetYear', formData.assetYear);
            setFieldText('assetMake', formData.assetMake);
            setFieldText('assetModel', formData.assetModel);
            setFieldText('VIN', formData.VIN);
            setFieldText('assetMiles', formData.assetMiles);
            setFieldText('assetHours', formData.assetHours);
            setFieldText('assetEngine', formData.assetEngine);
            setFieldText('assetEngineSerial', formData.assetEngineSerial);
            setFieldText('assetFuelTank', formData.assetFuelTank);
            setFieldText('assetTransmission', formData.assetTransmission);
            setFieldText('assetSuspension', formData.assetSuspension);
            setFieldText('assetTireSize', formData.assetTireSize);
            setFieldText('assetWheelType', formData.assetWheelType);
            setFieldText('assetSleeper', formData.assetSleeper);
            setFieldText('assetDoubleBunk', formData.assetDoubleBunk);
            setFieldText('assetInteriorColor', formData.assetInteriorColor);
            setFieldText('assetExteriorColor', formData.assetExteriorColor);
            setFieldText('assetExteriorOptions', formData.assetExteriorOptions);
            setFieldText('salePrice', formData.salePrice);
            setFieldText('lienholderName', formData.lienholderName);
            setFieldText('lienholderAddress', formData.lienholderAddress);
            setFieldText('lienholderCityStateZip', formData.lienholderCityStateZip);
            setFieldText('lienholderPhoneNumber', formData.lienholderPhoneNumber);
            setFieldText('payOff', formData.payOff);
            setFieldText('payOffExpiration', formData.payOffExpiration);

            // Serialize the PDF and trigger a download
            const pdfBytesFilled = await pdfDoc.save();
            const blob = new Blob([pdfBytesFilled], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `filled-seller-form.pdf`;
            link.click();
        } catch (error) {
            console.error('Error filling PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
        }
    };

    return (
        <div className='SellerFormContainers'>
            <h2>Seller Details</h2>
            <div className='formSelection'>
                <label htmlFor="pdfTemplate"></label>
                <select name="pdfTemplate" value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="SellerForms">Seller Forms</option>
                    <option value="ConsignmentForm">Consignment Form</option>
                    <option value="GuaranteeOfTitle">Guarantee of Title</option>
                    <option value="POASellerToSlate">POA Seller to Slate</option>
                    <option value="POASellerToSPP">POA Seller to State Plate Pro</option>
                </select>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='header'>
                    <DatePicker
                        selected={formData.dateReceived}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yy"
                        placeholderText="Select a date"
                    />
                    <input type="text" name="stockNumber" placeholder="Stock Number" onChange={handleChange} />
                </div>
    
                <div className='assetDetails'>
                    <input type="text" name="assetYear" placeholder="Asset Year" onChange={handleChange} />
                    <input type="text" name="assetMake" placeholder="Asset Make" onChange={handleChange} />
                    <input type="text" name="assetModel" placeholder="Asset Model" onChange={handleChange} />
                    <input type="text" name="VIN" placeholder="VIN" onChange={handleChange} />
                    <input type="text" name="assetMiles" placeholder="Miles" onChange={handleChange} />
                    <input type="text" name="assetHours" placeholder="Hours" onChange={handleChange} />
                    <input type="text" name="assetEngine" placeholder="Engine" onChange={handleChange} />
                    <input type="text" name="assetEngineSerial" placeholder="Engine Serial" onChange={handleChange} />
                    <input type="text" name="assetFuelTank" placeholder="Fuel Tank" onChange={handleChange} />
                    <input type="text" name="assetTransmission" placeholder="Transmission" onChange={handleChange} />
                    <input type="text" name="assetSuspension" placeholder="Suspension" onChange={handleChange} />
                    <input type="text" name="assetTireSize" placeholder="Tire Size" onChange={handleChange} />
                    <input type="text" name="assetWheelType" placeholder="Wheel Type" onChange={handleChange} />
                    <input type="text" name="assetSleeper" placeholder="Sleeper" onChange={handleChange} />
                    <input type="text" name="assetDoubleBunk" placeholder="Double Bunk" onChange={handleChange} />
                    <input type="text" name="assetInteriorColor" placeholder="Interior Color" onChange={handleChange} />
                    <input type="text" name="assetExteriorColor" placeholder="Exterior Color" onChange={handleChange} />
                    <input type="text" name="assetExteriorOptions" placeholder="Exterior Options" onChange={handleChange} />
                    <input type="text" name="salePrice" placeholder="Sale Price" onChange={handleChange} />
                    <input type="text" name="lienholderName" placeholder="Lienholder Name" onChange={handleChange} />
                    <input type="text" name="lienholderAddress" placeholder="Lienholder Address" onChange={handleChange} />
                    <input type="text" name="lienholderCityStateZip" placeholder="Lienholder City, State, Zip" onChange={handleChange} />
                    <input type="text" name="lienholderPhoneNumber" placeholder="Lienholder Phone Number" onChange={handleChange} />
                    <input type="text" name="payOff" placeholder="Payoff Amount" onChange={handleChange} />
                    <DatePicker
                        selected={formData.payOffExpiration}
                        onChange={(date) => setFormData({ ...formData, payOffExpiration: date })}
                        dateFormat="MM/dd/yy"
                        placeholderText="Payoff Expiration Date"
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Seller;
