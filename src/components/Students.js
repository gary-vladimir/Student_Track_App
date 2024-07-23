import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackBtn from "../assets/BackButton.svg";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [parentPhoneNumber, setParentPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/students")
      .then((response) => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the students!", error);
      });
  }, []);

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = { name, parent_phone_number: parentPhoneNumber };

    axios
      .post("http://127.0.0.1:5000/api/students", newStudent)
      .then((response) => {
        setStudents([...students, response.data]);
        setName("");
        setParentPhoneNumber("");
      })
      .catch((error) => {
        console.error("There was an error adding the student!", error);
      });
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl flex font-bold mb-6 text-[#2F4858]">
        {" "}
        <button onClick={() => navigate("/")}>
          <img
            src={BackBtn}
            alt="Add Group Icon"
            className="h-[40px] hover:scale-110 transition mt-1 mr-4"
          />
        </button>{" "}
        <div>Students 🧑‍🏫 </div>{" "}
      </h1>
      <div className="flex gap-6">
        <div className="w-1/2 h-[45vh] py-1 overflow-auto pr-2">
          <ul className="list-disc list-inside">
            {students.map((student) => (
              <li
                key={student.id}
                className="border-2 hover:-translate-y-1 transition hover:cursor-pointer relative z-10 border-[#69A1CB] p-3 pl-6 backdrop-blur-lg bg-white/50 rounded-lg mb-4 shadow-sm"
              >
                {student.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2 ">
          <div className="border-2 relative z-10 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-gray-700">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#F26419]"
                  placeholder="Enter full name here"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">
                  Tutor Phone Number:
                </label>
                <input
                  type="text"
                  id="parentPhoneNumber"
                  value={parentPhoneNumber}
                  onChange={(e) => setParentPhoneNumber(e.target.value)}
                  className="border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#F26419]"
                  placeholder="ex: +52 953 340 4382"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#69A1CB] text-white font-bold py-2 px-4 rounded hover:bg-[#4A90E2] transition"
              >
                CREATE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
