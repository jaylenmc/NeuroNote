import React from 'react';

const ContextMenu = ({ 
    sidebarContextMenu, 
    setSidebarContextMenu, 
    handleDeleteFolder 
}) => {
    if (!sidebarContextMenu.show) return null;

    return (
        <div
            className="sidebar-context-menu"
            style={{ 
                position: 'fixed', 
                top: sidebarContextMenu.y, 
                left: sidebarContextMenu.x, 
                zIndex: 9999, 
                background: '#232323', 
                color: '#fff', 
                borderRadius: 8, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
                padding: '8px 0', 
                minWidth: 120 
            }}
            onClick={() => setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null })}
            onContextMenu={e => e.preventDefault()}
        >
            <div
                className="sidebar-context-menu-item"
                style={{ padding: '8px 16px', cursor: 'pointer', color: '#FF6B6B' }}
                onClick={() => {
                    handleDeleteFolder(sidebarContextMenu.folderId);
                    setSidebarContextMenu({ show: false, x: 0, y: 0, folderId: null });
                }}
            >
                Delete Folder
            </div>
        </div>
    );
};

export default ContextMenu; 