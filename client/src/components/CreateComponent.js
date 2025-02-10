import React, { useState } from 'react';
import axios from 'axios';

function CreateComponent({ projectId, onClose, onComponentCreated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [component, setComponent] = useState({
        name: '',
        partCode: '',
        componentType: 'Enclosure',
        description: ''
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', component.name);
            formData.append('partCode', component.partCode);
            formData.append('componentType', component.componentType);
            formData.append('description', component.description);
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5001/api/projects/${projectId}/components`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            onComponentCreated();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating component');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Component</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Component Name</label>
                            <input
                                type="text"
                                value={component.name}
                                onChange={(e) => setComponent({...component, name: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Part Code</label>
                            <input
                                type="text"
                                value={component.partCode}
                                onChange={(e) => setComponent({...component, partCode: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Component Type</label>
                            <select
                                value={component.componentType}
                                onChange={(e) => setComponent({...component, componentType: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Enclosure">Enclosure</option>
                                <option value="Structural">Structural</option>
                                <option value="Fillers">Fillers</option>
                                <option value="Adhesives">Adhesives</option>
                                <option value="Packaging">Packaging</option>
                                <option value="Collateral">Collateral</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={component.description}
                                onChange={(e) => setComponent({...component, description: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Thumbnail</label>
                            <input
                                type="file"
                                onChange={handleImageChange}
                                className="w-full p-2 border rounded"
                                accept="image/*"
                            />
                            {thumbnailPreview && (
                                <img 
                                    src={thumbnailPreview} 
                                    alt="Preview" 
                                    className="mt-2 h-32 object-cover rounded"
                                />
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Component'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateComponent;