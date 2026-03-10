import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu_Data } from "./MenuData";

import Collapsed from "../../assets/svgs/icon-park_to-left.svg";
import Logout from "../../assets/svgs/logout.svg";
import Search from "../../assets/svgs/search.svg";
import menuHamburguer from "../../assets/svgs/menu_hamburguer_interno.svg";

interface SidebarProps {
  isCollapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isCollapsed, setCollapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const userData = JSON.parse(localStorage.getItem("@RaizDoBem:user") || "{}");
  const role = (userData.role as "admin" | "coordenador") || "admin";
  const userEmail = userData.email || "usuario@email.com";

  const initials = role === "admin" ? "AD" : "CO";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const menuLinks = Menu_Data[role];

  const handleLogout = () => {
    localStorage.removeItem("@RaizDoBem:token");
    localStorage.removeItem("@RaizDoBem:user");
    navigate("/auth/login");
  };

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-[1001] flex flex-col
          ${isCollapsed ? "w-24" : "w-[300px]"}
          ${isMobileOpen ? "translate-x-0 w-full" : "-translate-x-full lg:translate-x-0"} 
        `}
      >
        <div className="flex flex-col h-full p-6 lg:p-8">
          <div
            className={`flex items-center justify-between mb-10 ${isCollapsed ? "flex-col gap-4" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-darkgreen text-white rounded-lg flex items-center justify-center font-bold shrink-0">
                {initials}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-black">
                    {roleLabel}
                  </span>
                  <p className="text-[11px] text-gray-500 truncate">
                    {userEmail}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isMobileOpen) {
                  setIsMobileOpen(false);
                } else {
                  setCollapsed(!isCollapsed);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded shrink-0 z-[1002]"
            >
              <img
                src={Collapsed}
                alt="Fechar"
                className={`w-6 h-6 transition-transform 
                ${isCollapsed && !isMobileOpen ? "rotate-180" : ""} 
                ${isMobileOpen ? "rotate-0" : ""}
                `}
              />
            </button>
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <div className="relative mb-10">
              <img
                src={Search}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 opacity-50"
                alt=""
              />
              <input
                type="search"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange"
              />
            </div>
          )}

          <nav className="flex-1 overflow-y-auto no-scrollbar">
            <ul
              className={`${isMobileOpen ? "grid grid-cols-2 gap-4" : "space-y-2"}`}
            >
              {menuLinks.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center rounded-lg font-medium transition-all group
                      ${isCollapsed && !isMobileOpen ? "justify-center p-3" : "gap-4 p-3"}
                      ${isMobileOpen ? "flex-col text-center justify-center bg-gray-50" : ""}
                      ${
                        isActive && !isCollapsed
                          ? "bg-orange/10 text-orange border-r-4 border-orange rounded-r-none"
                          : "text-black hover:bg-gray-100"
                      }
                    `}
                  >
                    <img
                      src={item.icon}
                      className="min-h-7 min-w-7 shrink-0 object-contain"
                      alt=""
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="text-sm whitespace-nowrap overflow-hidden italic">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className={`flex items-center ${isCollapsed && !isMobileOpen ? "justify-center" : "gap-4"} w-full p-3 text-black hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors font-medium`}
            >
              <img src={Logout} className="min-h-7 min-w-7 shrink-0" alt="" />
              {(!isCollapsed || isMobileOpen) && <span>Sair da Conta</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Menu Mobile Fixo */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[90px] bg-[#f5f4f3] border-t-2 border-gray-200 rounded-t-[12px] z-[1000]">
        <ul className="flex items-center justify-around h-full px-4">
          <li>
            <NavLink to={menuLinks[0]?.path || "#"}>
              <img src={menuLinks[0]?.icon} className="w-10" alt="" />
            </NavLink>
          </li>

          <li>
            <NavLink to={menuLinks[1]?.path || "#"}>
              <img src={menuLinks[1]?.icon} className="w-10" alt="" />
            </NavLink>
          </li>

          <li className="relative -top-6">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="bg-darkgreen p-4 rounded-full shadow-lg active:scale-90 transition-transform"
            >
              <img src={menuHamburguer} className="w-8" alt="Menu" />
            </button>
          </li>

          <li>
            <NavLink to={menuLinks[2]?.path || "#"}>
              <img src={menuLinks[2]?.icon} className="w-10" alt="" />
            </NavLink>
          </li>

          <li>
            <NavLink to={menuLinks[3]?.path || "#"}>
              <img src={menuLinks[3]?.icon} className="w-10" alt="" />
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
