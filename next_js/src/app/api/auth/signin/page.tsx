"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    signIn("credentials", { username, email });
  };

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" required />
        <input type="email" name="email" placeholder="Email" required />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
