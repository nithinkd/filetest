import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateComponent from './CreateComponent';
import FileUpload from './FileUpload';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [components, setComponents] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(null);
    
    const userRole = localStorage.getItem('userRole');
    const canEditComponent = ['admin', 'design'].includes(userRole);
    const canCreateComponent = ['admin', 'design', 'procurement'].includes(userRole);

    const fetchProject = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProject(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching project');
        }
    }, [id]);

    const fetchComponents = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/projects/${id}/components`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComponents(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching components');
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
        fetchComponents();
    }, [fetchProject, fetchComponents]);

    const handleStatusChange = async (componentId, newStatus) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `http://localhost:5001/api/projects/${id}/components/${componentId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            if (response.data) {
                await fetchComponents();
                setError('');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating status';
            setError(errorMessage);
            await fetchComponents();
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (componentId, updatedData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5001/api/projects/${id}/components/${componentId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setEditingComponent(null);
            await fetchComponents();
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating component');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5001/api/projects/${id}/components/files/${fileId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1]);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError('Error downloading file');
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(
                    `http://localhost:5001/api/projects/${id}/components/files/${fileId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                fetchComponents();
            } catch (error) {
                setError('Error deleting file');
            }
        }
    };

    return (
        <div className="p-6">
            <button 
                onClick={() => navigate('/projects')}
                className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                Back to Projects
            </button>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {project && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <p>Project Code: {project.projectCode}</p>
                    <p>Client: {project.clientName}</p>
                </div>
            )}

            {canCreateComponent && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    Add Component
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map(component => (
                    <div key={component._id} className="border rounded p-4 shadow">
                        {component.thumbnail && (
                            <img 
                                src={`http://localhost:5001/${component.thumbnail}`} 
                                alt="Component thumbnail"
                                className="w-full h-40 object-cover mb-4 rounded"
                            />
                        )}
                        {editingComponent === component._id ? (
                            <EditComponentForm 
                                component={component}
                                onSave={(data) => handleEdit(component._id, data)}
                                onCancel={() => setEditingComponent(null)}
                                disabled={loading}
                            />
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold">{component.name}</h3>
                                <p>Part Code: {component.partCode}</p>
                                <p>Type: {component.componentType}</p>
                                <p>Status: 
                                    <span className={`ml-2 px-2 py-1 rounded ${
                                        component.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        component.status === 'Obsolete' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {component.status}
                                    </span>
                                </p>

                                <div className="mt-4">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h4 style={{ fontWeight: 'bold' }}>Files</h4>
                                        <button
                                            onClick={() => setShowFileUpload(showFileUpload === component._id ? null : component._id)}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {showFileUpload === component._id ? 'Cancel Upload' : 'Add Files'}
                                        </button>
                                    </div>

                                    {showFileUpload === component._id && (
                                        <FileUpload
                                            componentId={component._id}
                                            projectId={id}
                                            onFileUploaded={() => {
                                                setShowFileUpload(null);
                                                fetchComponents();
                                            }}
                                        />
                                    )}

                                    <div style={{ marginTop: '10px' }}>
                                        {component.files && component.files.length > 0 ? (
                                            <div>
                                                {Object.entries(
                                                    component.files.reduce((acc, file) => {
                                                        if (!acc[file.category]) acc[file.category] = [];
                                                        acc[file.category].push(file);
                                                        return acc;
                                                    }, {})
                                                ).map(([category, files]) => (
                                                    <div key={category} style={{ marginBottom: '10px' }}>
                                                        <h5 style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                                            {category.replace('_', ' ')}
                                                        </h5>
                                                        {files.map(file => (
                                                            <div 
                                                                key={file._id} 
                                                                style={{ 
                                                                    padding: '5px',
                                                                    backgroundColor: '#f3f4f6',
                                                                    marginBottom: '2px',
                                                                    borderRadius: '2px',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <span>{file.originalName}</span>
                                                                <div>
                                                                    <button 
                                                                        style={{ 
                                                                            marginLeft: '5px', 
                                                                            color: '#3b82f6',
                                                                            padding: '2px 6px',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onClick={() => handleDownload(file._id)}
                                                                    >
                                                                        Download
                                                                    </button>
                                                                    {canEditComponent && (
                                                                        <button 
                                                                            style={{ 
                                                                                marginLeft: '5px', 
                                                                                color: '#ef4444',
                                                                                padding: '2px 6px',
                                                                                border: 'none',
                                                                                background: 'none',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            onClick={() => handleDeleteFile(file._id)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No files uploaded yet</p>
                                        )}
                                    </div>
                                </div>

                                <p>Created by: {component.createdBy.username}</p>
                                <p>Created on: {new Date(component.createdAt).toLocaleDateString()}</p>
                                
                                {canEditComponent && (
                                    <div className="mt-4 space-y-2">
                                        <button
                                            onClick={() => setEditingComponent(component._id)}
                                            className="w-full bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <select
                                            value={component.status}
                                            onChange={(e) => handleStatusChange(component._id, e.target.value)}
                                            className="w-full border rounded p-1"
                                            disabled={loading}
                                        >
                                            <option value="Under Review">Under Review</option>
                                            <option value="Active">Active</option>
                                            <option value="Obsolete">Obsolete</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <CreateComponent
                    projectId={id}
                    onClose={() => setShowCreateModal(false)}
                    onComponentCreated={fetchComponents}
                />
            )}
        </div>
    );
}

function EditComponentForm({ component, onSave, onCancel, disabled }) {
    const [formData, setFormData] = useState({
        name: component.name,
        partCode: component.partCode,
        componentType: component.componentType
    });

    return (
        <div className="space-y-3">
            <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Component Name"
                disabled={disabled}
            />
            <input
                type="text"
                value={formData.partCode}
                onChange={(e) => setFormData({...formData, partCode: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Part Code"
                disabled={disabled}
            />
            <select
                value={formData.componentType}
                onChange={(e) => setFormData({...formData, componentType: e.target.value})}
                className="w-full p-2 border rounded"
                disabled={disabled}
            >
                <option value="Enclosure">Enclosure</option>
                <option value="Structural">Structural</option>
                <option value="Fillers">Fillers</option>
                <option value="Adhesives">Adhesives</option>
                <option value="Packaging">Packaging</option>
                <option value="Collateral">Collateral</option>
            </select>
            <div className="flex space-x-2">
                <button
                    onClick={() => onSave(formData)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={disabled}
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    disabled={disabled}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ProjectDetail;