// src/components/CreateGroup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../assets/BackButton.svg";
import decoration from "../assets/add_group_decoration.svg";

const CreateGroup = () => {
  const [title, setTitle] = useState("");
  const [groupCost, setGroupCost] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGroup = { title, group_cost: parseInt(groupCost, 10) };

    axios
      .post("http://127.0.0.1:5000/api/groups", newGroup)
      .then((response) => {
        console.log("Group created:", response.data);
        navigate("/"); // Redirect to home page after creating the group
      })
      .catch((error) => {
        console.error("There was an error creating the group!", error);
      });
  };

  return (
    <div>
      <h1 className="text-5xl flex font-bold mb-6 text-[#2F4858]">
        {" "}
        <button onClick={() => navigate("/")}>
          <img
            src={BackBtn}
            alt="Add Group Icon"
            className="h-[40px]  mt-1 mr-4"
          />
        </button>{" "}
        <div>Add Group</div>{" "}
      </h1>
      <form
        className="border-2 relative border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg w-[750px] shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Group Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="groupCost"
          >
            Group Cost
          </label>
          <input
            type="number"
            id="groupCost"
            value={groupCost}
            onChange={(e) => setGroupCost(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Group
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
