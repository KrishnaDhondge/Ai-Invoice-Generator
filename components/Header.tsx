import React from 'react';

interface HeaderProps {
    onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={onMenuToggle} className="text-slate-500 dark:text-slate-400 md:hidden">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
             <div className="flex items-center space-x-2">
                <span className="text-2xl" role="img" aria-label="invoice">🧾</span>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Invoice.AI</h1>
            </div>
        </div>
        
        <div className="flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Pricing</a>
            <div className="relative group">
                <button className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                   <span role="img" aria-label="user">👤</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Logout</a>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
