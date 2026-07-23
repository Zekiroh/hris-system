import { useState, type FC, type FormEvent } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '../../../assets/logo.svg';

const ForgotPassword: FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Steady green background */}
            <div
                className="absolute inset-0"
                style={{ background: '#059669' }}
            />

            <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 z-10">
                {/* Left Side - Branding */}
                <div className="flex-1 flex flex-col items-center text-center">
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150" />
                        <img src={logo} alt="SimpleVia Logo" className="w-48 h-48 drop-shadow-2xl relative" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white tracking-wider drop-shadow-lg">
                            SIMPLEVIA
                        </h1>
                        <p className="text-lg text-emerald-200/80 font-light tracking-[0.3em] uppercase">
                            Technologies, Inc
                        </p>
                        <p className="text-sm text-emerald-300/50 mt-4 max-w-xs mx-auto">
                            Human Resource Information System
                        </p>
                    </div>
                </div>

                {/* Right Side - Forgot Password Card */}
                <div className="flex-1 w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                        {!isSubmitted ? (
                            <>
                                {/* Header */}
                                <div className="mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                        <KeyRound className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
                                    <p className="text-emerald-200/60 text-sm">
                                        No worries! Enter your registered email and we'll send you a reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/50" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 focus:ring-1 focus:ring-emerald-400/20 transition-all text-sm"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-transparent shadow-lg shadow-emerald-900/30 transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Back to Login */}
                                <div className="mt-6 text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-emerald-300/70 hover:text-emerald-200 transition-colors font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-400/10">
                                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                                <p className="text-emerald-200/60 text-sm mb-1">
                                    We've sent a password reset link to:
                                </p>
                                <p className="text-emerald-300 font-semibold text-sm mb-6">
                                    {email}
                                </p>
                                <p className="text-emerald-200/40 text-xs mb-6">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => { setIsSubmitted(false); setEmail(''); }}
                                        className="w-full py-3 text-sm font-semibold rounded-xl text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
                                    >
                                        Try Another Email
                                    </button>
                                    <Link
                                        to="/login"
                                        className="w-full py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-900/30 transform transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <p className="text-center text-[10px] text-emerald-300/30 mt-6">
                            Powered by SimpleVia Technologies, Inc. © 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
