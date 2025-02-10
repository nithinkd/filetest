import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateProject() {
    const navigate = useNavigate();
    const [project, setProject] = useState({
        name: '',
        projectCode: '',
        clientName: '',
        priority: 'Normal'
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/projects/create', project, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/projects');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating project');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            {message && (
                <div className="mb-4 text-red-600">{message}</div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1">Project Name</label>
                        <input
                            type="text"
                            value={project.name}
                            onChange={(e) => setProject({...project, name: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Project Code</label>
                        <input
                            type="text"
                            value={project.projectCode}
                            onChange={(e) => setProject({...project, projectCode: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Client Name</label>
                        <input
                            type="text"
                            value={project.clientName}
                            onChange={(e) => setProject({...project, clientName: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Priority</label>
                        <select
                            value={project.priority}
                            onChange={(e) => setProject({...project, priority: e.target.value})}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Lightspeed">Lightspeed</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;