import React, { useState } from "react";
import {
  Bolt,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  Component,
  Earth,
  EllipsisVertical,
  Grid2X2Check,
  Group,
  Home,
  IdCard,
  ListTree,
  LucideProps,
  MonitorCog,
  PictureInPicture,
  Share2,
  SquareCode,
  SquareStack,
  Table,
  UserPen,
  Users,
  Settings,
  History,
  FileText,
  Variable,
} from "lucide-react";
import i18n from "../locales";
import { Link } from "react-router-dom";

const menus = [
  { label: i18n.t("Home"), link: "/", icon: Home },
  {
    label: i18n.t("Générer Bulletin"),
    groupId: "generate",
    link: "#",
    icon: FileText,
  },
  {
    label: i18n.t("Historique"),
    groupId: "history",
    link: "#",
    icon: History,
  },
  {
    label: i18n.t("Paramétrage"),
    groupId: "config",
    link: "#",
    icon: Settings,
  },
 
];

export default function Sidebar() {
  const [openGroup, setOpenGroup] = useState(null);
  const [currentLink, setCurrentLink] = useState(
    window.location.href.split("#")[1]
  );

  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-300 p-4 overflow-y-auto h-[calc(100vh-50px)]">
      <h2 className="text-xl font-bold mb-4">HISPCI-AGB</h2>
      {menus.map((menu, idx) => {
        const { icon: Icon, groupId, link, label, subItems } = menu;
        return !groupId ? (
          <Link
            key={`${link}-${idx}`}
            to={link}
            className={`block py-1 rounded hover:bg-gray-200 mb-4 ${
              currentLink === link ? "font-semibold text-blue-900" : ""
            }`}
            onClick={() => setCurrentLink(link)}
          >
            <div className="flex gap-2 justify-items-center items-center">
              <Icon size={15} />
              {label}
            </div>
          </Link>
        ) : (
          <div className="mb-4" key={groupId}>
            <button
              className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 mb-1"
              onClick={() => toggleGroup(groupId)}
            >
              <div
                className={`flex gap-2 justify-items-center items-center ${
                  currentLink.includes(`/${groupId}/`)
                    ? "font-semibold text-blue-900"
                    : ""
                }`}
              >
                {Icon && <Icon size={18} />}
                {label}
              </div>

              {openGroup === groupId ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
            {openGroup === groupId && (
              <ul className="ml-2 space-y-1 text-sm text-gray-800 mt-3">
                {subItems.map((subMenu, subIndex) => {
                  const {
                    icon: SubMenuIcon,
                    link: submenuLink,
                    label: subMenuLabel,
                  } = subMenu;
                  return (
                    <li key={`${groupId}-${submenuLink}-${subIndex}`}>
                      <Link
                        to={submenuLink}
                        className={`block px-2 py-1 rounded hover:bg-gray-200 ${
                          currentLink === submenuLink
                            ? "font-semibold text-blue-900"
                            : ""
                        }`}
                        onClick={() => setCurrentLink(submenuLink)}
                      >
                        <div className="flex gap-2 justify-items-center items-center">
                          <SubMenuIcon size={15} />
                          {subMenuLabel}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}