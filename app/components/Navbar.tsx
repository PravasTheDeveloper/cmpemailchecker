import Image from 'next/image';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo with Text */}
          <div className="flex items-center space-x-2 sm:space-x-3 hover-lift">
            <Image 
              src="/cmplogo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="drop-shadow-sm sm:w-10 sm:h-10" 
            />
            <span className="text-sm sm:text-lg lg:text-xl font-bold text-gradient">
              <span className="hidden sm:inline">CMPEMAILCHECKER</span>
              <span className="sm:hidden">CMP</span>
            </span>
          </div>

          {/* CODEMYPIXEL Button */}
          <div className="flex items-center">
            <a 
              href="https://codemypixel.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gradient px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover-lift shadow-lg"
            >
              <span className="hidden sm:inline">CODEMYPIXEL →</span>
              <span className="sm:hidden">CMP →</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 