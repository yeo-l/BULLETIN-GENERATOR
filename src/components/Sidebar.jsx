import React, { useState } from "react";
import {
  Home,
  Settings,
  History,
  FileText,
} from "lucide-react";
import i18n from "@dhis2/d2-i18n";

const menus = [
  { id: 'home', label: i18n.t("Home"), icon: Home },
  { id: 'generate', label: i18n.t("Générer Bulletin"), icon: FileText },
  { id: 'history', label: i18n.t("Historique"), icon: History },
  { id: 'config', label: i18n.t("Paramétrage"), icon: Settings },
];

export default function Sidebar({ onSelect }) {
  const [current, setCurrent] = useState('home');

  const handleSelect = (id) => {
    setCurrent(id);
    onSelect && onSelect(id);
  };

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
}