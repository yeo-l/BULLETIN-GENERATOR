import React, { useState, useCallback } from "react";
import {
  Home,
  Settings,
  History,
  FileText,
} from "lucide-react";
import i18n from "../locales";

const menus = [
  { id: 'home', label: i18n.t("Accueil"), icon: Home },
  { id: 'generate', label: i18n.t("Générer Bulletin"), icon: FileText },
  { id: 'history', label: i18n.t("Historique"), icon: History },
  { id: 'config', label: i18n.t("Paramétrage"), icon: Settings },
];

export default function Sidebar({ onSelect }) {
  const [current, setCurrent] = useState('home');

  const handleSelect = useCallback((id) => {
    setCurrent(id);
    onSelect?.(id);
  }, [onSelect]);

  const handleKeyDown = useCallback((event, id) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(id);
    }
  }, [handleSelect]);

  return (
    <aside 
      className="sidebar"
      style={{
        width: 226,
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: 16,
        minHeight: '100vh',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
      }}
      role="navigation"
      aria-label="Navigation principale"
    >
      <h2 
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 24,
          color: '#f97316',
          textAlign: 'center',
        }}
      >
        HISPCI-AGB
      </h2>
      
      <nav>
        <ul 
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {menus.map(({ id, label, icon: Icon }) => {
            const isActive = current === id;
            const baseStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
              color: '#ffffff',
              transition: 'all 0.2s ease-in-out',
              border: 'none',
              background: 'transparent',
              width: '100%',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
            };

            const activeStyle = {
              backgroundColor: '#1e293b',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transform: 'translateX(4px)',
            };

            const hoverStyle = {
              backgroundColor: isActive ? '#1e293b' : '#1e293b80',
              transform: isActive ? 'translateX(4px)' : 'translateX(2px)',
            };

            return (
              <li key={id}>
                <button
                  onClick={() => handleSelect(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    ...baseStyle,
                    ...(isActive ? activeStyle : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#1e293b80';
                      e.target.style.transform = 'translateX(2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateX(0)';
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${label}${isActive ? ' (page active)' : ''}`}
                  role="menuitem"
                >
                  <Icon 
                    size={18} 
                    style={{ 
                      color: '#f97316',
                      flexShrink: 0,
                    }} 
                  />
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div 
        style={{
          marginTop: 'auto',
          paddingTop: 24,
          borderTop: '1px solid #334155',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        <p>Version 1.0.0</p>
        <p>DHIS2 PEV Module</p>
      </div>
    </aside>
  );
}