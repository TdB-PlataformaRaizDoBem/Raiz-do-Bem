import React from "react";
import { Header } from "../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Sidebar from "../components/asidebar/Sidebar";

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
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main >
        <Outlet />
      </main>
    </div>
  );
};
