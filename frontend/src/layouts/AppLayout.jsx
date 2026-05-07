import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768); // 768px is md breakpoint

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Always visible on desktop, controlled by state on mobile */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={closeMobileSidebar} 
      />
      
      {/* Main Content Area - Flex column on mobile, positioned relative to sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation with toggle function */}
        <TopNav onMenuToggle={toggleMobileSidebar} />
        
        {/* Breadcrumb Navigation - Only on desktop */}
        {isDesktop && <BottomNav />}
        
        {/* Main Content - Scrollable area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;