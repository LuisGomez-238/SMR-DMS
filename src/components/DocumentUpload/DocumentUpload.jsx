import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import './DocumentUpload.css';

const DocumentUpload = ({ files, onFileAdd, onFileRemove }) => {
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(file => {
            onFileAdd({
                file,
                type: 'Other', // Default type
                preview: URL.createObjectURL(file)
            });
        });
    }, [onFileAdd]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    return (
        <div className="document-upload-container">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <FiUpload className="upload-icon" />
                <p>Drag & drop files here, or click to select files</p>
                <span className="file-info">Accepts PDF, JPG, PNG (max 10MB)</span>
            </div>

            {files.length > 0 && (
                <div className="file-list">
                    {files.map((fileData, index) => (
                        <div key={index} className="file-item">
                            <div className="file-info">
                                <span className="file-name">{fileData.file.name}</span>
                                <select
                                    value={fileData.type}
                                    onChange={(e) => {
                                        const newFiles = [...files];
                                        newFiles[index].type = e.target.value;
                                        onFileAdd(newFiles[index], index);
                                    }}
                                    className="file-type-select"
                                >
                                    <option value="Other">Other</option>
                                    <option value="CDL">CDL</option>
                                    <option value="Insurance">Insurance</option>
                                    <option value="Registration">Registration</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => onFileRemove(index)}
                                className="remove-file"
                            >
                                <FiX />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentUpload; 