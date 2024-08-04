import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import BackBtn from "../assets/BackButton.svg";
import decoration from "../assets/decoration.svg";
import decoration2 from "../assets/decorationPlants.svg";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { usePermissions } from "./usePermissions";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [parentPhoneNumber, setParentPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "https://studenttrackapi.com",
        });
        const response = await axios.get("http://127.0.0.1:5000/api/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the students!", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [getAccessTokenSilently]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const newStudent = { name, parent_phone_number: parentPhoneNumber };

    try {
      const token = await getAccessTokenSilently({
        audience: "https://studenttrackapi.com",
      });
      const response = await axios.post(
        "http://127.0.0.1:5000/api/students",
        newStudent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents([...students, response.data]);
      setName("");
      setParentPhoneNumber("");
    } catch (error) {
      console.error("There was an error adding the student!", error);
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  const handleStudentClick = (id) => {
    navigate(`/student/${id}`);
  };

  return (
    <div>
      <img
        src={decoration2}
        alt="Decorative SVG"
        className="absolute bottom-0 left-0 z-0"
      />
      <img
        src={decoration}
        alt="Decorative SVG"
        className="absolute top-0 right-0 z-0"
      />
      <h1 className="text-5xl flex font-bold mb-6 text-[#2F4858]">
        <button onClick={() => navigate("/")}>
          <img
            src={BackBtn}
            alt="Add Group Icon"
            className="h-[40px] hover:scale-110 transition mt-1 mr-4"
          />
        </button>
        <div>Students 🧑‍🏫</div>
      </h1>
      <div className="flex gap-6">
        <div className="w-1/2 h-[45vh] py-1 overflow-auto pr-2">
          <ul className="list-disc list-inside">
            {students.map((student) => (
              <li
                key={student.id}
                className="border-2 hover:-translate-y-1 transition hover:cursor-pointer relative z-10 border-[#69A1CB] p-3 pl-6 backdrop-blur-lg bg-white/50 rounded-lg mb-4 shadow-sm"
                onClick={() => handleStudentClick(student.id)}
              >
                {student.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2 ">
          {hasPermission("create:student") && (
            <div className="border-2 relative z-10 border-[#69A1CB] backdrop-blur-lg bg-white/50 rounded-lg shadow-sm">
              <h2 className="text-2xl bg-gradient-to-r from-[#69A1CB] to-[#55DDE0] font-semibold text-white p-3 pl-6 mb-4">
                Add New Student
              </h2>
              <form className="px-6 pb-6" onSubmit={handleAddStudent}>
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
                  <PhoneInput
                    country={"us"}
                    value={parentPhoneNumber}
                    onChange={(phone) => setParentPhoneNumber(phone)}
                    inputClass="border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#F26419]"
                    placeholder="ex: +52 953 340 4382"
                    inputStyle={{ width: "100%" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#55DDE0] text-[#2F4858] font-bold py-2 px-4 rounded hover:scale-110 transition"
                >
                  CREATE
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;
