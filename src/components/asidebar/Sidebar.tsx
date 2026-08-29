import React from "react";
import { NavLink } from "react-router-dom";
import { Menu_Data } from "./MenuData";
import { useUnread } from "../../hooks/useUnread";
import { useAuth } from "../../hooks/useAuth";
import { useSpeechContext } from "../../context/SpeechContext";

import Collapsed from "../../assets/svgs/icon-park_to-left.svg";
import Logout from "../../assets/svgs/logout.svg";
import menuHamburguer from "../../assets/svgs/menu_hamburguer_interno.svg";

interface SidebarProps {
  isCollapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isCollapsed, setCollapsed }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { totalUnread } = useUnread();
  const { ttsEnabled, setTtsEnabled, ttsSupported } = useSpeechContext();

  // Mantendo a nova lógica de tratamento do usuário logado
  const roleKey = user?.role === "ADMIN" ? "admin" : "coordenador";
  const roleLabel = user?.role === "ADMIN" ? "Administrador" : "Coordenador";
  const initials = user?.role === "ADMIN" ? "AD" : "CO";
  const userName = user?.nome ?? roleLabel;
  const userEmail = user?.email ?? "";

  const menuLinks = Menu_Data[roleKey] || [];

  return (
    <>
      <aside
        aria-label="Menu lateral"
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-[1001] flex flex-col
          ${isCollapsed ? "w-24" : "w-[300px]"}
          ${isMobileOpen ? "translate-x-0 w-full" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-6 lg:p-8">
          {/* Header da Sidebar Antiga — Avatar + Botão Collapse */}
          <div
            className={`flex items-center justify-between mb-10 ${isCollapsed ? "flex-col gap-4" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-darkgreen text-white rounded-lg flex items-center justify-center font-bold shrink-0">
                {initials}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-black truncate">
                    {userName}
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
              aria-label={isCollapsed && !isMobileOpen ? "Expandir menu lateral" : "Recolher menu lateral"}
              aria-expanded={!isCollapsed || isMobileOpen}
              className="p-1 hover:bg-gray-100 rounded shrink-0 z-[1002] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
            >
              <img
                src={Collapsed}
                alt=""
                aria-hidden="true"
                className={`w-6 h-6 transition-transform
                  ${isCollapsed && !isMobileOpen ? "rotate-180" : ""}
                  ${isMobileOpen ? "rotate-0" : ""}
                `}
              />
            </button>
          </div>

          {/* Navegação Principal */}
          <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto flex flex-col">
            <ul
              className={`${isMobileOpen ? "grid grid-cols-1 min-[404px]:grid-cols-2 gap-6 mt-10 pb-20" : "space-y-2 mt-8"}`}
            >
              {menuLinks.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center rounded-lg font-medium transition-all group
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50
                      ${isCollapsed && !isMobileOpen ? "justify-center p-3" : "gap-4 p-3"}
                      ${isMobileOpen ? "flex-col text-center justify-center bg-gray-50" : ""}
                      ${
                        isActive && !isCollapsed
                          ? "bg-orange/10 text-orange border-r-4 border-orange rounded-r-none"
                          : "text-black hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.icon}
                        className="min-h-7 min-w-7 object-contain"
                        alt=""
                        aria-hidden="true"
                      />
                      {item.hasBadge && totalUnread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-darkgreen text-white text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5 leading-none">
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </span>
                      )}
                    </div>
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

          {/* Footer — Acessibilidade + Logout */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-1">

            {/* Toggle Text-to-Speech — visível apenas quando a API é suportada */}
            {ttsSupported && (
              <button
                type="button"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                aria-label={ttsEnabled ? "Desativar leitura em voz alta" : "Ativar leitura em voz alta"}
                aria-pressed={ttsEnabled}
                title={ttsEnabled ? "Desativar voz" : "Ativar voz"}
                className={`flex items-center ${isCollapsed && !isMobileOpen ? "justify-center" : "gap-4"} w-full p-3 rounded-lg transition-colors font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 ${
                  ttsEnabled
                    ? "bg-darkgreen/10 text-darkgreen"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {ttsEnabled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="min-w-5 min-h-5 w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="min-w-5 min-h-5 w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                )}
                {(!isCollapsed || isMobileOpen) && (
                  <span>{ttsEnabled ? "Voz ativa" : "Ativar voz"}</span>
                )}
              </button>
            )}

            <button
              onClick={logout}
              aria-label="Sair da conta"
              className={`flex items-center ${isCollapsed && !isMobileOpen ? "justify-center" : "gap-4"} w-full p-3 text-black hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50`}
            >
              <img src={Logout} className="min-h-7 min-w-7 shrink-0" alt="" aria-hidden="true" />
              {(!isCollapsed || isMobileOpen) && <span>Sair da Conta</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Menu Mobile no Bottom Fixo Estilizado Antigo */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[85px] bg-[#f5f4f3] border-t-2 border-gray-200 rounded-t-[20px] z-40 px-6">
        <ul className="flex items-center justify-between h-full max-w-md mx-auto">
          {menuLinks.slice(0, 2).map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `p-2 block transition-transform active:scale-90 ${isActive ? "brightness-75" : ""}`
                }
              >
                <div className="relative">
                  <img
                    src={item.icon}
                    className="w-8 h-8 object-contain"
                    alt={item.label}
                  />
                  {item.hasBadge && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-darkgreen text-white text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5 leading-none">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
              </NavLink>
            </li>
          ))}

          {/* Botão Hambúrguer Centralizado flutuante */}
          <li className="relative -top-8">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="bg-darkgreen p-5 rounded-full shadow-xl active:scale-95 transition-all border-4 border-[#f5f4f3]"
            >
              <img
                src={menuHamburguer}
                className="w-7 h-7"
                alt="Abrir Menu Lateral"
              />
            </button>
          </li>

          {menuLinks.slice(2, 4).map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `p-2 block transition-transform active:scale-90 ${isActive ? "brightness-75" : ""}`
                }
              >
                <div className="relative">
                  <img
                    src={item.icon}
                    className="w-8 h-8 object-contain"
                    alt={item.label}
                  />
                  {item.hasBadge && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-darkgreen text-white text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5 leading-none">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;