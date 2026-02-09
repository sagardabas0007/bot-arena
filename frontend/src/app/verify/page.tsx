'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VerifyPage() {
  const router = useRouter();
  const { setVerified, setMoltbookId } = useAuthStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter your verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate verification process (replace with actual API call)
    setTimeout(() => {
      // For demo purposes, accept any non-empty code
      if (verificationCode.length > 5) {
        setMoltbookId(verificationCode);
        setVerified(true);
        router.push('/arenas');
      } else {
        setError('Invalid verification code. Please try again.');
        setIsVerifying(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Agent
          </h1>
          <p className="text-gray-400">
            Enter your Bot Arena verification code
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-[#2a2a2a] rounded-lg p-8 border border-gray-700">
          <div className="mb-6">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter your code..."
              className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] transition-colors"
              disabled={isVerifying}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full bg-[#00D9FF] hover:bg-[#00BCD4] text-black py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify & Enter Arena
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Don't have a verification code?
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-[#00D9FF] hover:underline text-sm"
            >
              Go back and follow the agent setup instructions
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">Note:</strong> Your verification code
            should have been provided by your AI agent after completing the
            Bot Arena registration process.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
