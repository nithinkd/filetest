function FileCategory({ category, files, onDownload, onDelete, canEdit }) {
    return (
        <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ 
                borderBottom: '2px solid #f3f4f6',
                paddingBottom: '8px',
                marginBottom: '12px'
            }}>
                <h5 style={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#374151'
                }}>
                    {category.replace('_', ' ')}
                    <span style={{ 
                        marginLeft: '8px',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontWeight: 'normal'
                    }}>
                        ({files.length} {files.length === 1 ? 'file' : 'files'})
                    </span>
                </h5>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map(file => (
                    <div 
                        key={file._id} 
                        style={{ 
                            padding: '8px 12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            border: '1px solid transparent',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.border = '1px solid #e5e7eb'}
                        onMouseLeave={(e) => e.currentTarget.style.border = '1px solid transparent'}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ 
                                fontSize: '0.875rem',
                                color: '#374151',
                                wordBreak: 'break-all'
                            }}>
                                {file.originalName}
                            </span>
                            <span style={{ 
                                fontSize: '0.75rem',
                                color: '#6b7280'
                            }}>
                                {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={() => onDownload(file._id)}
                                style={{ 
                                    padding: '4px 8px',
                                    color: '#3b82f6',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Download
                            </button>
                            {canEdit && (
                                <button 
                                    onClick={() => onDelete(file._id)}
                                    style={{ 
                                        padding: '4px 8px',
                                        color: '#ef4444',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}