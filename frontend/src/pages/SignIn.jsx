import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../config/env";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase.js";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { isStrongPassword, isValidEmail } from "../utils/validation";
import { logger } from "../utils/logger";
import AuthShell from "../components/ui/AuthShell";
import BrandButton from "../components/ui/BrandButton";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const inputClassName =
    "w-full rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-white/90 px-3.5 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--brand-1)] focus:ring-2 focus:ring-[color:var(--brand-soft)]";

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
  

    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email: normalizedEmail,
          password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      setError("");
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        { withCredentials: true },
      );
      dispatch(setUserData({ user: data }));
    } catch (error) {
      logger.error("Google sign-in failed", error);
      setError(error?.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue your food journey with smart recommendations and realtime tracking."
      sideTitle="From craving to doorstep, in one smooth flow."
      sideDescription="Discover local favorites, live-track delivery, and enjoy a checkout built for speed. BiteBlaze keeps your ordering experience effortless on every screen."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-(--text-secondary) mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-(--text-secondary) mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={inputClassName}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3.5 text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            className="text-sm font-semibold text-(--brand-2) hover:opacity-80 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <BrandButton
          className="w-full mt-2"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={18} color="white" /> : "Sign In"}
        </BrandButton>

        <BrandButton
          variant="ghost"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </BrandButton>

        <p className="text-sm text-center text-(--text-muted) pt-1">
          New to BiteBlaze?{" "}
          <button
            type="button"
            className="font-semibold text-(--brand-2) hover:opacity-80 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

export default SignIn;
