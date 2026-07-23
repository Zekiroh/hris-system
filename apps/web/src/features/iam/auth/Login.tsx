import { useEffect, useRef, useState, type FC, type FormEvent } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../app/auth/AuthContext";
import logo from "../../../assets/logo.svg";

const UI_EMAIL = "ui.loginEmail";
const UI_REMEMBER = "ui.rememberMe";

const Login: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");

  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [remember, setRemember] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login, loginRole, setLoginRole } = useAuth();

  useEffect(() => {
    const rawRemember = localStorage.getItem(UI_REMEMBER);
    const nextRemember = rawRemember === "true";
    setRemember(nextRemember);

    if (nextRemember) {
      const savedEmail = localStorage.getItem(UI_EMAIL) ?? "";
      setEmail(savedEmail);
    } else {
      setEmail("");
      localStorage.removeItem(UI_EMAIL);
    }

    localStorage.removeItem("ui.loginRole");
    localStorage.removeItem("token");
    sessionStorage.removeItem("ui.loginRole");
    sessionStorage.removeItem("token");
  }, []);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => {
      setError(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [error]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const password = passwordRef.current?.value ?? "";

      await login(email, password, remember);

      localStorage.setItem(UI_REMEMBER, remember ? "true" : "false");
      if (remember) {
        localStorage.setItem(UI_EMAIL, email);
      } else {
        localStorage.removeItem(UI_EMAIL);
      }

      // Do NOT manually clear the DOM password immediately.
      // Let the browser/password manager do its thing.
      // If you want to clear, do it AFTER navigation or on logout.

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#059669" }} />

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 z-10">
        {/* Left Side - Branding */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150" />
            <img
              src={logo}
              alt="SimpleVia Logo"
              className="w-48 h-48 drop-shadow-2xl relative"
            />
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

        {/* Right Side - Login Card */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome Back
              </h2>
              <p className="text-emerald-200/60 text-sm">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Mode Tabs (uses auth.loginRole only) */}
            <div className="flex rounded-xl bg-white/10 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("USER");
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  loginRole === "USER"
                    ? "bg-white text-emerald-700 shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                User Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginRole("ADMIN");
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  loginRole === "ADMIN"
                    ? "bg-white text-emerald-700 shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
              {/* Username/Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/50" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={email}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEmail(v);
                      if (remember) localStorage.setItem(UI_EMAIL, v);
                    }}
                    className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 focus:ring-1 focus:ring-emerald-400/20 transition-all text-sm"
                    placeholder="Enter your username/email"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/50" />
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 focus:ring-1 focus:ring-emerald-400/20 transition-all text-sm"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-emerald-300/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-emerald-300/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setRemember(next);

                      localStorage.setItem(UI_REMEMBER, next ? "true" : "false");
                      if (next) localStorage.setItem(UI_EMAIL, email);
                      else localStorage.removeItem(UI_EMAIL);
                    }}
                    className="w-3.5 h-3.5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400/30"
                  />
                  <span className="text-xs text-emerald-200/60">
                    Remember me
                  </span>
                </label>

                <Link to="/forgot-password" className="text-xs font-medium text-emerald-300/70 hover:text-emerald-200 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-transparent shadow-lg shadow-emerald-900/30 transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-emerald-300/30 mt-6">
              Powered by Simplevia Technologies, Inc. © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;