'use client';

import React from 'react';
import Navbar from './components/Navbar';
import EmailVerifier from './components/EmailVerifier';

export default function Home() {
  return (
    <div className="min-h-screen bg-pattern">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-4 sm:mb-6 tracking-tight">
              CMP Email Checker
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Verify email address thanks to our CMP free email verifier tool.
            </p>
          </div>

          {/* Email Verifier Component */}
          <EmailVerifier />
        </div>
      </main>
    </div>
  );
}
