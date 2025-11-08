import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full py-4 px-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center space-x-4">
                 <a href="#" className="hover:text-blue-500">About</a>
                 <span>&copy; {new Date().getFullYear()} Invoice.AI. All rights reserved.</span>
            </div>
        </footer>
    );
};

export default Footer;
