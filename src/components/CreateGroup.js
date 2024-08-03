import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import BackBtn from "../assets/BackButton.svg";
import decoration from "../assets/add_group_decoration.svg";

const CreateGroup = () => {
  const [title, setTitle] = useState("");
  const [groupCost, setGroupCost] = useState(200);
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newGroup = { title, group_cost: parseInt(groupCost, 10) };

    try {
      const token = await getAccessTokenSilently({
        audience: "https://studenttrackapi.com",
      });

      const response = await axios.post(
        "http://127.0.0.1:5000/api/groups",
        newGroup,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Group created:", response.data);
      navigate("/"); // Redirect to home page after creating the group
    } catch (error) {
      console.error("There was an error creating the group!", error);
    }
  };

  return (
    <div>
      <h1 className="text-5xl flex font-bold mb-6 text-[#2F4858]">
        <button onClick={() => navigate("/")}>
          <img
            src={BackBtn}
            alt="Add Group Icon"
            className="h-[40px] hover:scale-110 transition mt-1 mr-4"
          />
        </button>
        <div>Add Group</div>
      </h1>
      <form
        className="border-2 relative z-10 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg w-[750px] shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-[#2F4858] font-medium mb-2"
            htmlFor="title"
          >
            Name for group:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. English Beginners 7 - 8 am "
            className="appearance-none border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-[#2F4858] font-medium mb-2 mt-6"
            htmlFor="groupCost"
          >
            Cost Amount (MX)
          </label>
          <input
            type="number"
            id="groupCost"
            value={groupCost}
            onChange={(e) => setGroupCost(e.target.value)}
            className="appearance-none border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center gap-4 justify-between">
          <button
            type="submit"
            className="bg-[#55E0A6] w-1/2 hover:scale-105 transition text-[#007242] font-bold py-2 rounded-md focus:outline-none focus:shadow-outline"
          >
            ACCEPT
          </button>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="bg-[#D9D9D9] text-[#8C8C8C] font-bold hover:scale-105 transition w-1/2 py-2 rounded-md"
          >
            CANCEL
          </button>
        </div>
      </form>
      <img
        src={decoration}
        alt="Decorative SVG"
        className="absolute bottom-8 right-8 z-0"
        style={{ height: "65vh" }}
      />
    </div>
  );
};

export default CreateGroup;
