import React, { useCallback, memo } from "react";
import {
  Home,
  Settings,
  History,
  FileText,
} from "lucide-react";
import i18n from "@dhis2/d2-i18n";

const menus = [
  { id: 'home', label: "Accueil", icon: Home },
  { id: 'generate', label: "Générer Bulletin", icon: FileText },
  { id: 'history', label: "Historique", icon: History },
  { id: 'config', label: "Paramétrage", icon: Settings },
];

const Sidebar = memo(({ onSelect, current = 'home' }) => {

  const handleSelect = useCallback((id) => {
    onSelect && onSelect(id);
  }, [onSelect]);

  const asideStyle = {
    width: 226,
    backgroundColor: '#0f172a', // bleu nuit
    color: '#ffffff',
    padding: 16,
    minHeight: '100vh',
    boxSizing: 'border-box',
  };

  const titleStyle = {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 24,
  };

  const listStyle = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const linkBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    borderRadius: 6,
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    color: '#ffffff',
  };

  const activeStyle = {
    backgroundColor: '#1e293b', // bleu plus clair pour l'actif
    fontWeight: 600,
  };

  const iconStyle = {
    color: '#f97316', // orange
  };

  return (
    <aside style={asideStyle}>
      <h2 style={titleStyle}>HISPCI-AGB</h2>
      <nav>
        <ul style={listStyle}>
          {menus.map(({ id, label, icon: Icon }) => {
            const style = current === id
              ? { ...linkBaseStyle, ...activeStyle }
              : linkBaseStyle;
            return (
              <li key={id}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleSelect(id); }}
                  style={style}
                  aria-current={current === id ? 'page' : undefined}
                >
                  <Icon size={18} style={iconStyle} />
                  <span>{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;