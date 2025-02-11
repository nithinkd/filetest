import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateComponent from './CreateComponent';
import FileUpload from './FileUpload';

// ProjectDetail Component: Main component for displaying and managing project details and components
function ProjectDetail() {
    // Route parameter extraction for project ID
    const { id } = useParams();
    const navigate = useNavigate();

    // State management hooks
    // Project and components state
    const [project, setProject] = useState(null);
    const [components, setComponents] = useState([]);

    // Modal and interaction states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(null);

    // Error and loading states
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Role-based access control
    // Retrieve user role from local storage
    const userRole = localStorage.getItem('userRole');
    const canEditComponent = ['admin', 'design'].includes(userRole);
    const canCreateComponent = ['admin', 'design', 'procurement'].includes(userRole);

    // Fetch project details from the backend
    // useCallback prevents unnecessary re-renders
    const fetchProject = useCallback(async () => {
        try {
            // Retrieve authentication token
            const token = localStorage.getItem('token');
            
            // Make authenticated API call to fetch project details
            const response = await axios.get(`http://localhost:5001/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update project state with fetched data
            setProject(response.data);
        } catch (error) {
            // Handle and display any errors during project fetch
            setError(error.response?.data?.message || 'Error fetching project');
        }
    }, [id]);

    // Fetch components associated with the project
    const fetchComponents = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Make authenticated API call to fetch project components
            const response = await axios.get(`http://localhost:5001/api/projects/${id}/components`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update components state with fetched data
            setComponents(response.data);
        } catch (error) {
            // Handle and display any errors during components fetch
            setError(error.response?.data?.message || 'Error fetching components');
        }
    }, [id]);

    // Fetch project and components when component mounts or dependencies change
    useEffect(() => {
        fetchProject();
        fetchComponents();
    }, [fetchProject, fetchComponents]);

    // Handle component status change 
    const handleStatusChange = async (componentId, newStatus) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Make API call to update component status
            const response = await axios.patch(
                `http://localhost:5001/api/projects/${id}/components/${componentId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Refresh components list on successful update
            if (response.data) {
                await fetchComponents();
                setError('');
            }
        } catch (error) {
            // Handle and display any errors during status update
            const errorMessage = error.response?.data?.message || 'Error updating status';
            setError(errorMessage);
            await fetchComponents();
        } finally {
            setLoading(false);
        }
    };

    // Handle component edit
    const handleEdit = async (componentId, updatedData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Make API call to update component details
            await axios.put(
                `http://localhost:5001/api/projects/${id}/components/${componentId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Reset editing state and refresh components
            setEditingComponent(null);
            await fetchComponents();
            setError('');
        } catch (error) {
            // Handle and display any errors during edit
            setError(error.response?.data?.message || 'Error updating component');
        } finally {
            setLoading(false);
        }
    };

    // Handle file download for a specific component file
    const handleDownload = async (componentId, fileId) => {
        try {
            const token = localStorage.getItem('token');
            
            // Make API call to download file with blob response
            const response = await axios.get(
                `http://localhost:5001/api/projects/${id}/components/${componentId}/files/${fileId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            
            // Create a temporary URL for file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            const fileName = contentDisposition ? contentDisposition.split('filename=')[1] : 'download';
            
            // Trigger file download
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            // Handle and display any errors during download
            setError('Error downloading file');
            console.error('Download error:', error);
        }
    };

    // Handle file deletion for a specific component file
    const handleDeleteFile = async (componentId, fileId) => {
        // Confirm file deletion with user
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                const token = localStorage.getItem('token');
                
                // Make API call to delete file
                await axios.delete(
                    `http://localhost:5001/api/projects/${id}/components/${componentId}/files/${fileId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                // Refresh components list and clear any errors
                await fetchComponents();
                setError('');
            } catch (error) {
                // Handle and display any errors during file deletion
                setError('Error deleting file');
                console.error('Delete error:', error);
            }
        }
    };

    // Render the project details and components
    return (
        <div className="p-6">
            {/* Back to projects navigation button */}
            <button 
                onClick={() => navigate('/projects')}
                className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                Back to Projects
            </button>

            {/* Error message display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Project details display */}
            {project && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <p>Project Code: {project.projectCode}</p>
                    <p>Client: {project.clientName}</p>
                </div>
            )}

            {/* Add Component button (role-based) */}
            {canCreateComponent && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    Add Component
                </button>
            )}

            {/* Components grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map(component => (
                    // Individual component card
                    <div key={component._id} className="border rounded p-4 shadow">
                        {/* Thumbnail display */}
                        {component.thumbnail && (
                            <img 
                                src={`http://localhost:5001/${component.thumbnail}`} 
                                alt="Component thumbnail"
                                className="w-full h-40 object-cover mb-4 rounded"
                            />
                        )}

                        {/* Conditional rendering for editing mode */}
                        {editingComponent === component._id ? (
                            <EditComponentForm 
                                component={component}
                                onSave={(data) => handleEdit(component._id, data)}
                                onCancel={() => setEditingComponent(null)}
                                disabled={loading}
                            />
                        ) : (
                            <>
                                {/* Component details display */}
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

                                {/* Files section */}
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

                                    {/* File Upload Component */}
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

                                    {/* Files Display */}
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
                                                                        onClick={() => handleDownload(component._id, file._id)}
                                                                        style={{ 
                                                                            marginLeft: '5px', 
                                                                            color: '#3b82f6',
                                                                            padding: '2px 6px',
                                                                            border: 'none',
                                                                            background: 'none',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        Download
                                                                    </button>
                                                                    {canEditComponent && (
                                                                        <button 
                                                                            onClick={() => handleDeleteFile(component._id, file._id)}
                                                                            style={{ 
                                                                                marginLeft: '5px', 
                                                                                color: '#ef4444',
                                                                                padding: '2px 6px',
                                                                                border: 'none',
                                                                                background: 'none',
                                                                                cursor: 'pointer'
                                                                            }}
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

                                {/* Component metadata */}
                                <p>Created by: {component.createdBy.username}</p>
                                <p>Created on: {new Date(component.createdAt).toLocaleDateString()}</p>
                                
                                {/* Edit and status change options (role-based) */}
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

            {/* Create Component Modal */}
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

// EditComponentForm: Inline editing form for a component
function EditComponentForm({ component, onSave, onCancel, disabled }) {
    // State for form data
    const [formData, setFormData] = useState({
        name: component.name,
        partCode: component.partCode,
        componentType: component.componentType
    });

    // Render edit form with input fields and save/cancel buttons
    return (
        <div className="space-y-3">
            {/* Component Name Input */}
            <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Component Name"
                disabled={disabled}
            />
            
            {/* Part Code Input */}
            <input
                type="text"
                value={formData.partCode}
                onChange={(e) => setFormData({...formData, partCode: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Part Code"
                disabled={disabled}
            />
            
            {/* Component Type Dropdown */}
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
            
            {/* Save and Cancel Buttons */}
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