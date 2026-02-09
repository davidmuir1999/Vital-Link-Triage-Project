"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      const session = await getSession();

      switch (session?.user.role) {
        case "TRIAGE_NURSE":
          router.push("/triage");
          break;
        case "DOCTOR":
          router.push("/ward");
          break;
        case "SITE_MANAGER":
          router.push("/dashboard");
          break;
        case "CLEANER":
          router.push("/cleaning");
          break;
        default:
          router.push("/dashboard");
          break;
      }
      router.refresh();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="employee@nhs.net"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="password123"
          />
        </div>

        {error && (
          <div>
            <p>{error}</p>
          </div>
        )}

        <Button
          variant="outline"
          size="lg"
          disabled={loading}
          className="relative min-w-30"
        >
          {loading ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              Log In
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
