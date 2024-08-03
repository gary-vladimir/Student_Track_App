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

const App = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return (
    <div className="bg-[#E7F9FA] p-36 min-h-screen">
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/create-group" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/students" element={<Students />} />
          <Route path="/student/:id" element={<StudentDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
