import React from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onCreateNew: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onCreateNew, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setIsOpen(false)}></div>}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-50 dark:bg-slate-800 p-4 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center space-x-2 mb-8 md:hidden">
            <span className="text-2xl" role="img" aria-label="invoice">🧾</span>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Invoice.AI</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem
            icon="📊"
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
        </nav>
        <div>
          <button
            onClick={onCreateNew}
            className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span>➕</span>
            <span>New Invoice</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
