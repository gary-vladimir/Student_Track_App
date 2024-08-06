import React, { useState, useEffect } from "react";
import axios from "axios";
import decoration from "../assets/search_app_decoration.svg";
import addIcon from "../assets/BigAddButton.svg";
import studentBtn from "../assets/students_Button.svg";
import "../scrollbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import config from "../config";

const Home = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupsAndUserPermissions = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const token = await getAccessTokenSilently({
            audience: "https://studenttrackapi.com",
          });

          // Fetch groups
          const response = await axios.get(`${config.API_URL}/api/groups`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGroups(response.data);

          // Get user permissions from the token
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          setUserPermissions(decodedToken.permissions || []);

          setLoading(false);
        } catch (error) {
          console.error("There was an error fetching the data!", error);
          setLoading(false);
        }
      }
    };

    fetchGroupsAndUserPermissions();
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  const canCreateGroup = userPermissions.includes("create:group");

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="">
      <div className="flex justify-between relative z-10">
        <div className="flex">
          <h1 className="text-5xl font-bold mb-6 text-[#2F4858]">Groups</h1>
          {canCreateGroup && (
            <button
              className="hover:scale-110 transition"
              onClick={() => navigate("/create-group")}
            >
              <img
                src={addIcon}
                alt="Add Group Icon"
                className="h-[40px] mb-3 ml-3"
              />
            </button>
          )}
        </div>
        <div className="flex">
          <h1 className="text-5xl font-bold mb-6 text-[#2F4858]">Students</h1>
          <button
            className="hover:scale-110 transition"
            onClick={() => navigate("/students")}
          >
            <img
              src={studentBtn}
              alt="Add Group Icon"
              className="h-[40px] mb-3 ml-3"
            />
          </button>
        </div>
      </div>
      <div className="grid pr-2 grid-cols-4 grid-rows-[auto_auto] overflow-y-auto relative max-h-[50vh] gap-5 z-50">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border-2 relative border-[#69A1CB] backdrop-blur-lg bg-white/50 rounded-lg w-full shadow-sm"
          >
            <div className="p-4">
              <h3 className="text-xl text-[#2F4858] font-semibold">
                {group.title}
              </h3>
              <p className=" text-[#2F4858]">
                Number of students: {group.students.length}
              </p>
            </div>
            <div className="absolute top-1 right-2 text-[#F26419]">
              ${group.group_cost}
            </div>
            <button
              onClick={() => navigate(`/group/${group.id}`)}
              className="bg-white text-center w-full font-medium transition-colors delay-75 text-[#2F4858]/75 hover:text-[#2F4858] border-t hover:cursor-pointer hover:bg-[#55DDE0] rounded-b-lg border-[#69A1CB] py-2"
            >
              View all details
            </button>
          </div>
        ))}
      </div>
      <img
        src={decoration}
        alt="Decorative SVG"
        className="absolute bottom-5 right-5 z-0"
        style={{ height: "75vh" }}
      />
    </div>
  );
};

export default Home;
