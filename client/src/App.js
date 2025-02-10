import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import CreateProject from './components/CreateProject';
import ProjectList from './components/ProjectList';  // Add this import
import ProjectDetail from './components/ProjectDetail';



function Navigation() {
  
    const role = localStorage.getItem('userRole');
    console.log('Current role:', role);
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between">
                <div className="space-x-4">
                {(role === 'admin' || role === 'design' || role === 'procurement') &&  (
                        <Link to="/create-project" className="text-white">Create Project</Link>
                    )}
                    
                    <Link to="/projects" className="text-white">Projects</Link>
                    {role === 'admin' && (
                        <Link to="/admin" className="text-white">Admin</Link>
                    )}
                </div>
                
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="text-white"
                >
                    Logout
                </button>
            </div>
        </nav>
        
    );
}

function App() {
    return (
        <BrowserRouter>
            <div>
                {localStorage.getItem('token') && <Navigation />}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/create-project" element={<CreateProject />} />
                    <Route path="/projects" element={<ProjectList />} />  {/* Add this route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;