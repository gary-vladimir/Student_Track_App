// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./components/Home";
import CreateGroup from "./components/CreateGroup";
import GroupDetails from "./components/GroupDetails";
import Students from "./components/Students";
import StudentDetails from "./components/StudentDetails";
import Loading from "./components/Loading";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return <Component {...rest} />;
};

const App = () => {
  return (
    <div className="bg-[#E7F9FA] p-36 min-h-screen">
      <Routes>
        <Route exact path="/" element={<ProtectedRoute component={Home} />} />
        <Route
          path="/create-group"
          element={<ProtectedRoute component={CreateGroup} />}
        />
        <Route
          path="/group/:id"
          element={<ProtectedRoute component={GroupDetails} />}
        />
        <Route
          path="/students"
          element={<ProtectedRoute component={Students} />}
        />
        <Route
          path="/student/:id"
          element={<ProtectedRoute component={StudentDetails} />}
        />
      </Routes>
    </div>
  );
};

export default App;
