import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        projectCode: '',
        clientName: ''
    });

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleEdit = (project) => {
        setEditingProject(project._id);
        setEditForm({
            name: project.name,
            projectCode: project.projectCode,
            clientName: project.clientName
        });
    };

    const handleEditSubmit = async (projectId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5001/api/projects/${projectId}`,
                editForm,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setEditingProject(null);
            fetchProjects();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                    <div key={project._id} className="border rounded p-4 shadow">
                        {editingProject === project._id ? (
                            // Edit Form
                            <div>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full p-2 mb-2 border rounded"
                                    placeholder="Project Name"
                                />
                                <input
                                    type="text"
                                    value={editForm.projectCode}
                                    onChange={(e) => setEditForm({...editForm, projectCode: e.target.value})}
                                    className="w-full p-2 mb-2 border rounded"
                                    placeholder="Project Code"
                                />
                                <input
                                    type="text"
                                    value={editForm.clientName}
                                    onChange={(e) => setEditForm({...editForm, clientName: e.target.value})}
                                    className="w-full p-2 mb-2 border rounded"
                                    placeholder="Client Name"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditSubmit(project._id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingProject(null)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Display Mode
                            <>
                                <h3 className="text-xl font-semibold">{project.name}</h3>
                                <p>Code: {project.projectCode}</p>
                                <p>Client: {project.clientName}</p>
                                <p>Priority: {project.priority}</p>
                                <p>Created by: {project.creator.userId.username}</p>
                                <p>Created on: {new Date(project.createdAt).toLocaleDateString()}</p>
                                
                                <Link 
    to={`/projects/${project._id}`}
    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
>
    View Components
</Link>
                                


                                {localStorage.getItem('userRole') === 'admin' && (
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectList;