import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./components/Home";
import CreateGroup from "./components/CreateGroup";
import GroupDetails from "./components/GroupDetails";
import Students from "./components/Students";
import StudentDetails from "./components/StudentDetails";
import Navbar from "./components/Navbar";

const App = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow bg-[#E7F9FA] p-20">
          {isAuthenticated ? (
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/create-group" element={<CreateGroup />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/students" element={<Students />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <Navigate to="/login" replace />
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
