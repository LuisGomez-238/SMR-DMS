import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../App.css';
// Define the paths to your PDF templates
const pdfTemplates = {
    BuyerForms: '/pdfs/BuyerForms.pdf',
    BillOfSale: '/pdfs/BillOfSale.pdf',
    POABuyerToSlate: '/pdfs/POABuyerToSlate.pdf',
    POABuyerToSPP: '/pdfs/POABuyerToSPP.pdf',
    CreditApp: '/pdfs/CreditApp.pdf',
    AOFAuth: '/pdfs/AOFAuth.pdf',
};

const Deal = () => {
    const [formData, setFormData] = useState({
        buyerName: '',
        buyerEmail: '',
        buyerAddress: '',
        buyerCity: '',
        buyerState: '',
        buyerZip: '',
        date: new Date(),
        buyerCompanyName: '',
        buyerPhone: '',
        // Asset details
        buyerCDLNumber: '',
        buyerYearsDriving: '',
        buyerYearsOwner: '',
        assetPlateNumber: '',
        buyerFleetSize: '',
        buyerTrucksInFleet: '',
        buyerTrailersInFleet: '',
        buyerEIN: '',
        buyerSS: '',
        buyerCDLState: '',
    });

    const [selectedTemplate, setSelectedTemplate] = useState('BuyerForms');

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
            date: date,
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
            const pdfBytes = await loadPdf(template); // Use selected template
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

            // Fill in the PDF form fields using the helper function
            setFieldText('buyerName', formData.buyerName);
            setFieldText('buyerEmail', formData.buyerEmail);
            setFieldText('buyerAddress', formData.buyerAddress);
            setFieldText('buyerCity', formData.buyerCity);
            setFieldText('buyerState', formData.buyerState);
            setFieldText('buyerZip', formData.buyerZip);
            setFieldText('date', format(formData.date, 'MM/dd/yy')); // Format date
            setFieldText('salesPerson', formData.salesPerson);
            setFieldText('dealNumber', formData.dealNumber);
            setFieldText('sellerName', formData.sellerName);
            setFieldText('sellerCompanyName', formData.sellerCompanyName);
            setFieldText('sellerAddress', formData.sellerAddress);
            setFieldText('sellerCityStateZip', formData.sellerCityStateZip);
            setFieldText('sellerPhone', formData.sellerPhone);
            setFieldText('sellerEmail', formData.sellerEmail);
            setFieldText('buyerCompanyName', formData.buyerCompanyName);
            setFieldText('buyerCityStateZip', formData.buyerCityStateZip);
            setFieldText('buyerPhone', formData.buyerPhone);
            setFieldText('stockNumber', formData.stockNumber);

            // Fill in asset details
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
            setFieldText('sellerCDLNumber', formData.sellerCDLNumber);
            setFieldText('buyerCDLNumber', formData.buyerCDLNumber);
            setFieldText('buyerYearsDriving', formData.buyerYearsDriving);
            setFieldText('buyerYearsOwner', formData.buyerYearsOwner);
            setFieldText('assetPlateNumber', formData.assetPlateNumber);
            setFieldText('buyerFleetSize', formData.buyerFleetSize);
            setFieldText('buyerTrucksInFleet', formData.buyerTrucksInFleet);
            setFieldText('buyerTrailersInFleet', formData.buyerTrailersInFleet);
            setFieldText('buyerEIN', formData.buyerEIN);
            setFieldText('buyerSS', formData.buyerSS);
            setFieldText('buyerCDLState', formData.buyerCDLState);
            setFieldText('sellerCDLState', formData.sellerCDLState);

            // Serialize the PDF and trigger a download
            const pdfBytesFilled = await pdfDoc.save();
            const blob = new Blob([pdfBytesFilled], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `filled-form.pdf`;
            link.click();
        } catch (error) {
            console.error('Error filling PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
        }
    };

    return (
        <div className='DealForm'>
            <h2>New Deal Forms</h2>
            <div className='formSelection'>
                <label htmlFor="pdfTemplate"></label>
                <select name="pdfTemplate" value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="BuyerForms">Deal Package</option>
                    <option value="BillOfSale">Bill of Sale</option>
                    <option value="CreditApp">Credit App</option>
                    <option value="AOFAuth">AOF Credit Authorization</option>
                    <option value="POABuyerToSlate">POA Buyer to Slate</option>
                    <option value="POABuyerToSPP">POA Buyer to State Plate Pro</option>
                </select>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='header'>
                    <DatePicker
                        selected={formData.date}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yy"
                        placeholderText="Select a date"
                    />
                    <input type="text" name="salesPerson" placeholder="Sales Person" onChange={handleChange} />
                    <input type="text" name="dealNumber" placeholder="Deal Number" onChange={handleChange} />
                    <input type="text" name="stockNumber" placeholder="Stock Number" onChange={handleChange} />
                </div>
                <div className='buyerInfo'>
                    <h2>Buyer Information</h2>
                    <input type="text" name="buyerName" placeholder="Buyer Name" onChange={handleChange} />
                    <input type="text" name="buyerCompanyName" placeholder="Company Name" onChange={handleChange} />
                    <input type="text" name="buyerAddress" placeholder="Address" onChange={handleChange} />
                    <input type="text" name="buyerCity" placeholder="City" onChange={handleChange} />
                    <input type="text" name="buyerState" placeholder="State" onChange={handleChange} />
                    <input type="text" name="buyerZip" placeholder="Zip" onChange={handleChange} />                    
                    <input type="tel" name="buyerPhone" placeholder="Phone" onChange={handleChange} />
                    <input type="email" name="buyerEmail" placeholder="Email" onChange={handleChange} />
                    <input type="text" name="buyerCDLNumber" placeholder="CDL Number" onChange={handleChange} />
                    <input type="text" name="buyerCDLState" placeholder="CDL State" onChange={handleChange} />
                    <input type="text" name="buyerYearsDriving" placeholder="Years Driving" onChange={handleChange} />
                    <input type="text" name="buyerYearsOwner" placeholder="Years as Owner" onChange={handleChange} />
                    <input type="text" name="buyerFleetSize" placeholder="Fleet Size" onChange={handleChange} />
                    <input type="text" name="buyerTrucksInFleet" placeholder="Trucks in Fleet" onChange={handleChange} />
                    <input type="text" name="buyerTrailersInFleet" placeholder="Trailers in Fleet" onChange={handleChange} />
                    <input type="text" name="buyerEIN" placeholder="EIN" onChange={handleChange} />
                    <input type="text" name="buyerSocial" placeholder="SSN" onChange={handleChange} />
                </div>
                {/* <div className='sellerInfo'>
                    <h2>Seller Information</h2>
                    <input type="text" name="sellerName" placeholder="Seller Name" onChange={handleChange} />
                    <input type="text" name="sellerCompanyName" placeholder="Company Name" onChange={handleChange} />
                    <input type="text" name="sellerAddress" placeholder="Address" onChange={handleChange} />
                    <input type="text" name="sellerCityStateZip" placeholder="City, State, Zip" onChange={handleChange} />
                    <input type="tel" name="sellerPhone" placeholder="Phone" onChange={handleChange} />
                    <input type="email" name="sellerEmail" placeholder="Email" onChange={handleChange} />
                    <input type="text" name="sellerCDLNumber" placeholder="CDL Number" onChange={handleChange} />
                    <input type="text" name="sellerCDLState" placeholder="CDL State" onChange={handleChange} />
                </div> */}
                <div className='assetDetails'>
                    <h2>Asset Details</h2>
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
                    <input type="tel" name="lienholderPhoneNumber" placeholder="Lienholder Phone Number" onChange={handleChange} />
                    <input type="text" name="payOff" placeholder="Pay Off" onChange={handleChange} />
                    <input type="text" name="payOffExpiration" placeholder="Pay Off Expiration" onChange={handleChange} />
                    <input type="text" name="assetPlateNumber" placeholder="Asset Plate Number" onChange={handleChange} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Deal;
