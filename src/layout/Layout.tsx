import React from "react";
import { Header } from "../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Sidebar from "../components/asidebar/Sidebar";
import UserHeader from "../components/userHeader/UserHeader";

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

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar isCollapsed={isCollapsed} setCollapsed={setIsCollapsed} />

      <main
        className={`
          flex-1 transition-all duration-300 min-h-screen
          ${isCollapsed ? "lg:ml-24" : "lg:ml-[300px]"} 
          max-lg:ml-0 max-lg:pb-[100px] p-6 lg:p-10 lg:pt-20
        `}
      >
        <UserHeader />
          <Outlet />
      </main>
    </div>
  );
};
