import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SidebarShadcn";
import Header from "./HeaderShadcn";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7ff 0%, #f5f3ff 50%, #f0f9ff 100%)" }}>
      <Sidebar isMobile={isMobile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ paddingLeft: isMobile ? 0 : 260 }}>
        <Header isMobile={isMobile} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
