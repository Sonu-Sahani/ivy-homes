import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const allowedUsers = [
  "demo1@ivy.homes",
  "demo2@ivy.homes",
  "demo3@ivy.homes",
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!allowedUsers.includes(normalizedEmail)) {
      setError("Please use one of the assigned demo accounts.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
      });

      // Support both possible token field names
      const token = response.data.token || response.data.access_token;
      const user = response.data.user;

      if (!token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      // Remove any old token
      localStorage.removeItem("ivy_token");
      localStorage.removeItem("ivy_user");
      sessionStorage.removeItem("ivy_token");
      sessionStorage.removeItem("ivy_user");

      // Save new token
      if (rememberMe) {
        localStorage.setItem("ivy_token", token);
        localStorage.setItem("ivy_user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("ivy_token", token);
        sessionStorage.setItem("ivy_user", JSON.stringify(user));
      }

      navigate("/listings");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F5F3EE] flex overflow-hidden">
      {/* LEFT IMAGE */}
      <div className="hidden lg:block lg:w-[45%] h-full relative overflow-hidden">
        <img
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png"
          alt="Luxury property"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute bottom-10 left-10 right-10 text-white max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-white/80">
            Ivy Homes
          </p>

          <h1 className="text-4xl xl:text-5xl font-light leading-tight">
            Find a place
            <br />
            worth calling home.
          </h1>

          <p className="mt-4 text-sm text-white/80 leading-6 max-w-sm">
            Explore properties, discover projects and save the places that
            feel right for you.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="w-full lg:w-[55%] h-full flex items-center justify-center px-6 sm:px-10">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          {/* LOGO */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#252525]">
              Ivy Homes
            </h2>

            <div className="w-9 h-[2px] bg-[#5D7052] mt-2" />
          </div>

          {/* HEADING */}
          <div className="mb-6">
            <h3 className="text-3xl xl:text-4xl font-medium text-[#252525]">
              Welcome back
            </h3>

            <p className="text-sm text-[#77736B] mt-2">
              Sign in to continue exploring properties.
            </p>
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4B4944] mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-11 px-4 rounded-lg border border-[#D8D5CE] bg-white text-[#252525] text-sm outline-none transition focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#4B4944] mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 px-4 rounded-lg border border-[#D8D5CE] bg-white text-[#252525] text-sm outline-none transition focus:border-[#5D7052] focus:ring-1 focus:ring-[#5D7052]"
              required
            />
          </div>


          {/* ERROR */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#F7E9E6] border border-[#E5C8C1] text-[#9B5144] text-sm">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-[#252525] text-white text-sm font-medium hover:bg-[#3A3936] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* FOOTER */}
          <p className="text-xs text-[#8A867D] text-center mt-5 leading-5">
            Use your assigned Ivy Homes demo credentials to sign in.
          </p>
        </form>
      </div>
    </div>
  );
}