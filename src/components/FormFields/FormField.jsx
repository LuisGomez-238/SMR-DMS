import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import './FormField.css';

const FormField = ({
    label,
    type,
    value,
    onChange,
    error,
    tooltip,
    options,
    required,
    ...props
}) => {
    return (
        <div className="form-field">
            <div className="field-label">
                <label>{label} {required && <span className="required">*</span>}</label>
                {tooltip && (
                    <div className="tooltip">
                        <QuestionMarkCircleIcon className="tooltip-icon" />
                        <span className="tooltip-text">{tooltip}</span>
                    </div>
                )}
            </div>
            
            {type === 'select' ? (
                <select
                    value={value}
                    onChange={onChange}
                    className={error ? 'error' : ''}
                    {...props}
                >
                    <option value="">Select {label}</option>
                    {options?.map(option => 
                        typeof option === 'object' ? (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ) : (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        )
                    )}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    className={error ? 'error' : ''}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={error ? 'error' : ''}
                    {...props}
                />
            )}
            
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default FormField; 