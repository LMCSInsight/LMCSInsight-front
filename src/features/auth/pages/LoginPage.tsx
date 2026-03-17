import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext";
import { authApi } from "@/features/auth/api/authApi";
import { mapBackendUserToDisplayUser, type AuthResponse } from "@/features/auth/types";
import { getDashboardPath } from "@/config/routes";
import { ROUTES } from "@/config/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const raw = res.data as AuthResponse | { data?: AuthResponse };
      const payload = raw && "data" in raw && raw.data ? raw.data : (raw as AuthResponse);
      const token = payload.token;
      const user = payload.user;
      const displayUser = mapBackendUserToDisplayUser(user);
      const path = getDashboardPath(user.role, user);
      login(displayUser, token);
      navigate(path, { replace: true });
    } catch (err: unknown) {
      const axErr = err && typeof err === "object" && "response" in err ? (err as { response?: { status?: number; data?: unknown } }) : null;
      setError(
        axErr?.response?.status === 401 || axErr?.response?.status === 400
          ? "Invalid email or password"
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    // UI only – no backend; optional toast "Coming soon"
  }

  return (
    <div className="flex flex-col gap-[52px] w-full max-w-[554px]">
      <h1
        className="text-[2rem] xl:text-[2.5rem] font-semibold leading-tight"
        style={{ color: "#182B45" }}
      >
        Connexion
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[55px]">
        {error && (
          <div
            className="rounded-lg border border-red-500/50 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[41px]">
          {/* Email */}
          <div className="flex flex-col gap-2.5">
            <Label
              htmlFor="email"
              className="text-base font-medium"
              style={{ color: "#0C3456" }}
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@esi.dz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="h-[54px] w-full rounded-[10px] border border-black bg-white px-6 text-[#0C3356] placeholder:text-[#0C3356] focus-visible:ring-2 focus-visible:ring-[#182B45]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2.5">
            <Label
              htmlFor="password"
              className="text-base font-medium"
              style={{ color: "#0C3456" }}
            >
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="h-[54px] w-full rounded-[10px] border border-black bg-white px-6 text-[#0C3356] placeholder:text-[#0C3356] focus-visible:ring-2 focus-visible:ring-[#182B45]"
            />
          </div>

          {/* Primary button: Connexion */}
          <button
            type="submit"
            disabled={loading}
            className="h-[58px] w-full rounded-[10px] font-medium text-white transition-opacity disabled:opacity-70"
            style={{ backgroundColor: "#21334E" }}
          >
            {loading ? "Connexion…" : "Connexion"}
          </button>

          {/* Divider */}
          <p className="text-center text-sm text-black">
            --OU CONTINUER AVEC --
          </p>

          {/* Google button (UI only) */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="h-[60px] w-full rounded-[10px] flex items-center justify-center gap-3 font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C4C4C4", color: "#182B45" }}
          >
            <GoogleIcon />
            <span>Connexion avec Google @esi.dz</span>
          </button>
        </div>
      </form>

      <Link
        to={ROUTES.FORGOT_PASSWORD}
        className="text-sm underline underline-offset-2 hover:no-underline"
        style={{ color: "#0C3456" }}
      >
        Mot de passe oublié ?
      </Link>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
