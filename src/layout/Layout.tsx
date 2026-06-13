import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Sidebar from "../components/asidebar/Sidebar";
import UserHeader from "../components/userHeader/UserHeader";
import { UnreadProvider } from "../context/UnreadContext";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-white">
      <Outlet />
    </main>
  );
};

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const isChatRoute = location.pathname.includes("/chat");

  return (
    <UnreadProvider>
      <div className={`bg-white flex max-w-450 mx-auto ${isChatRoute ? "h-screen overflow-hidden" : "min-h-screen"}`}>
        <Sidebar isCollapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        <main
          className={`
            flex-1 transition-all duration-300 relative
            ${isCollapsed ? "lg:ml-24" : "lg:ml-75"}
            max-lg:ml-0
            ${isChatRoute
              ? "h-screen overflow-hidden flex flex-col pt-3 lg:pb-3!"
              : "min-h-screen max-lg:pb-25 p-6 lg:p-10 lg:pt-20"
            }
          `}
          style={isChatRoute ? {
            paddingBottom: "calc(120px + env(safe-area-inset-bottom, 0px))",
          } : undefined}
        >
          {!isChatRoute && <UserHeader />}
          <Outlet />
        </main>
      </div>
    </UnreadProvider>
  );
};
