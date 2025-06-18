'use client';

import React from 'react';
import Navbar from './components/Navbar';
import EmailVerifier from './components/EmailVerifier';

export default function Home() {
  return (
    <div className="min-h-screen bg-pattern">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6 tracking-tight">
              CMP Email Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
