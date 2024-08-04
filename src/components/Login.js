import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E7F9FA]">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-[#2F4858]">
          Student Track App
        </h1>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-[#55DDE0] text-white px-4 py-2 rounded hover:bg-[#45C7CA] transition"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
