import Image from 'next/image';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Text */}
          <div className="flex items-center space-x-3 hover-lift">
            <Image src="/cmplogo.png" alt="Logo" width={40} height={40} className="drop-shadow-sm" />
            <span className="text-xl font-bold text-gradient">CMPEMAILCHECKER</span>
          </div>

          {/* CODEMYPIXEL Button */}
          <div className="flex items-center">
            <a 
              href="https://codemypixel.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gradient px-6 py-3 rounded-xl text-sm font-semibold hover-lift shadow-lg"
            >
              CODEMYPIXEL →
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 