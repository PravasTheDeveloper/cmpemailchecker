'use client';

import React, { useState } from 'react';

interface VerificationResult {
  isValid: boolean;
  email: string;
  format: {
    isValid: boolean;
    message: string;
  };
  professional: {
    isValid: boolean;
    message: string;
  };
  domainStatus: {
    isValid: boolean;
    message: string;
  };
  mailbox: {
    isValid: boolean;
    message: string;
  };
}

const EmailVerifier = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify email');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to verify email. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleExampleClick = (exampleEmail: string) => {
    setEmail(exampleEmail);
    setResult(null);
    setError(null);
  };

  return (
    <div className="card-gradient rounded-2xl p-8 max-w-4xl mx-auto hover-lift">
      

      {/* Input Section */}
      <div className="mb-8">
        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-4">
          Enter an email address to verify:
        </label>
        <div className="flex gap-4">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="info@selectedfirms.co"
            className="flex-1 input-gradient px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition-all"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className={`btn-gradient hover:disabled:transform-none disabled:opacity-90 px-10 py-4 rounded-xl font-semibold text-lg hover-lift min-w-[140px] relative overflow-hidden ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2 relative z-10">
                <div className="w-5 h-5 border-2 rounded-full loader-spinner"></div>
                <span className="loading-text">VERIFYING...</span>
              </div>
            ) : (
              'VERIFY'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-red-600 text-sm">{error}</p>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="border-t border-gradient-to-r from-blue-100 to-green-100 pt-8">
          {/* Main Result */}
          <div className="flex items-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-5 shadow-xl hover-lift ${
              result.isValid ? 'status-valid' : 'status-invalid'
            }`}>
              {result.isValid ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`text-3xl font-bold mb-1 ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {result.isValid ? 'Valid' : 'Invalid'}
              </h3>
              <p className="text-gray-600 text-lg">
                {result.email} is {result.isValid ? 'a valid' : 'an invalid'} email address
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Check */}
            <div className="card-gradient p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Format</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.format.isValid 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                }`}>
                  {result.format.isValid ? 'valid' : 'invalid'}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result.format.message}</p>
            </div>

            {/* Professional Check */}
            <div className="card-gradient p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Professional</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.professional.isValid 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                }`}>
                  {result.professional.isValid ? 'valid' : 'invalid'}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result.professional.message}</p>
            </div>

            {/* Domain Status Check */}
            <div className="card-gradient p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Domain status</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.domainStatus.isValid 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                }`}>
                  {result.domainStatus.isValid ? 'valid' : 'invalid'}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result.domainStatus.message}</p>
            </div>

            {/* Mailbox Check */}
            <div className="card-gradient p-6 rounded-xl hover-lift">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Mailbox</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.mailbox.isValid 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                }`}>
                  {result.mailbox.isValid ? 'valid' : 'invalid'}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result.mailbox.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Examples Section */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm leading-relaxed">
          Examples:{' '}
          <button 
            onClick={() => handleExampleClick('elon@spacex.com')}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 cursor-pointer font-medium transition-all duration-200 hover:scale-105"
          >
            elon@spacex.com
          </button>
          {' - '}
          <button 
            onClick={() => handleExampleClick('invalid@mailmeteor.com')}
            className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 cursor-pointer font-medium transition-all duration-200 hover:scale-105"
          >
            invalid@mailmeteor.com
          </button>
          {' - '}
          <button 
            onClick={() => handleExampleClick('pablo@picasso')}
            className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 cursor-pointer font-medium transition-all duration-200 hover:scale-105"
          >
            pablo@picasso
          </button>
          {' - '}
          <button 
            onClick={() => handleExampleClick('thismaildoesnotexists@email.example')}
            className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 cursor-pointer font-medium transition-all duration-200 hover:scale-105"
          >
            thismaildoesnotexists@email.example
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerifier; 