  import React from "react";
  import { NavLink, useNavigate } from "react-router-dom";
  import { Menu_Data } from "./MenuData";

  import Collapsed from "../../assets/svgs/icon-park_to-left.svg";
  import Logout from "../../assets/svgs/logout.svg";
  import menuHamburguer from "../../assets/svgs/menu_hamburguer_interno.svg";
  import Search from "../ui/Search";

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
                <Search placeholder="Pesquisar" />
            )}

            <nav className="flex-1 overflow-y-auto flex flex-col">
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

        {/* Menu Mobile no bottom fixo*/}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full h-[85px] bg-[#f5f4f3] border-t-2 border-gray-200 rounded-t-[20px] z-40 px-6">
        <ul className="flex items-center justify-between h-full max-w-md mx-auto">
          
          {menuLinks.slice(0, 2).map((item) => (
            <li key={item.label}>
              <NavLink to={item.path} className={({ isActive }) => `p-2 block transition-transform active:scale-90 ${isActive ? 'brightness-75' : ''}`}>
                <img src={item.icon} className="w-8 h-8 object-contain" alt={item.label} />
              </NavLink>
            </li>
          ))}

          <li className="relative -top-8">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="bg-darkgreen p-5 rounded-full shadow-xl active:scale-95 transition-all border-4 border-[#f5f4f3]"
            >
              <img src={menuHamburguer} className="w-7 h-7" alt="Abrir Menu Lateral" />
            </button>
          </li>

          {menuLinks.slice(2, 4).map((item) => (
            <li key={item.label}>
              <NavLink to={item.path} className={({ isActive }) => `p-2 block transition-transform active:scale-90 ${isActive ? 'brightness-75' : ''}`}>
                <img src={item.icon} className="w-8 h-8 object-contain" alt={item.label} />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      </>
    );
  };

export default Sidebar;
