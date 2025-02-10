import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'management'
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            setMessage('Error fetching users');
        }
    };

    const handleChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5001/api/users/create',
                newUser,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMessage('User created successfully');
            setNewUser({ username: '', email: '', password: '', role: 'management' });
            fetchUsers();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating user');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchUsers();
                setMessage('User deleted successfully');
            } catch (error) {
                setMessage('Error deleting user');
            }
        }
    };
    

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            
            <div style={{ maxWidth: '500px', margin: '20px 0' }}>
                <h2>Create New User</h2>
                {message && (
                    <div style={{ margin: '10px 0', color: message.includes('success') ? 'green' : 'red' }}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            required
                        />
                        <select
                            name="role"
                            value={newUser.role}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="design">Design</option>
                            <option value="procurement">Procurement</option>
                            <option value="quality">Quality</option>
                            <option value="management">Management</option>
                        </select>
                    </div>
                    <button 
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Create User
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h2>Existing Users</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                            <th style={tableHeaderStyle}>Username</th>
                             <th style={tableHeaderStyle}>Email</th>
                             <th style={tableHeaderStyle}>Role</th>
                             <th style={tableHeaderStyle}>Actions</th>  
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
    <tr key={user._id}>
        <td style={tableCellStyle}>{user.username}</td>
        <td style={tableCellStyle}>{user.email}</td>
        <td style={tableCellStyle}>{user.role}</td>
        <td style={tableCellStyle}>
            <button
                onClick={() => handleDelete(user._id)}
                style={{
                    padding: '5px 10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Delete
            </button>
        </td>
    </tr>
))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const tableHeaderStyle = {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderBottom: '2px solid #e5e7eb'
};

const tableCellStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
};

export default AdminDashboard;