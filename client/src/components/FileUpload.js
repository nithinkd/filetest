import React, { useState } from 'react';
import axios from 'axios';

function FileUpload({ componentId, projectId, onFileUploaded }) {
    const [selectedCategory, setSelectedCategory] = useState('3D_Models');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fileCategories = {
        '3D_Models': ['.step','.stp'],
        '2D_Drawings': ['.pdf', '.dxf'],
        'Artwork': ['.cdr', '.ai', '.psd','.pdf'],
        'Images': ['.jpeg', '.jpg', '.png'],
        'Documents': ['.doc', '.docx', '.pdf'],
        'Vendor_Data': ['.txt','.pdf']
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (fileCategories[selectedCategory].includes(extension)) {
                setSelectedFile(file);
                setError('');
            } else {
                setError(`Invalid file type. Allowed types for ${selectedCategory}: ${fileCategories[selectedCategory].join(', ')}`);
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading state when upload starts
        
        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('file', selectedFile);
    
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5001/api/projects/${projectId}/components/${componentId}/files`,
                formData,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            onFileUploaded();
            setSelectedFile(null);
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false); // Reset loading state when upload completes
        }
    };

    return (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Upload File</h4>
            
            {error && (
                <div style={{ color: '#dc2626', marginBottom: '10px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleUpload}>
                <div style={{ marginBottom: '10px' }}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '8px', 
                            marginBottom: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        {Object.keys(fileCategories).map(category => (
                            <option key={category} value={category}>
                                {category.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="file"
                        onChange={handleFileChange}
                        style={{ marginBottom: '10px' }}
                    />
                    
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '10px' }}>
                        Allowed types: {fileCategories[selectedCategory].join(', ')}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!selectedFile || loading}
                    style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: !selectedFile || loading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !selectedFile || loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Uploading...' : 'Upload File'}
                </button>
            </form>
        </div>
    );
}

export default FileUpload;