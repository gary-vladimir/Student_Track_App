import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="flex w-full items-center justify-center">
      <div className="bg-white w-[450px] flex flex-col items-center p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-[#2F4858]">
          Student Track App
        </h1>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-[#55DDE0] w-full text-white px-4 py-2 rounded hover:bg-[#45C7CA] transition"
        >
          LOG IN
        </button>
      </div>
    </div>
  );
};

export default Login;
