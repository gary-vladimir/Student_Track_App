import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { logout, user } = useAuth0();

  return (
    <nav className="bg-[#2F4858] z-50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Student Track App</div>
        <div className="flex items-center">
          {user && <span className="text-white mr-4">{user.name}</span>}
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="bg-[#F26419] text-white px-4 py-2 rounded hover:bg-[#D55B15] transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
