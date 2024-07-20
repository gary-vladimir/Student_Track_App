// src/components/GroupDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../assets/BackButton.svg";

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/api/groups/${id}`)
      .then((response) => {
        setGroup(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the group details!", error);
      });
  }, [id]);

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center text-xl">Group not found</div>;
  }

  return (
    <div>
      <h1 className="text-5xl flex font-bold mb-6 text-[#2F4858]">
        {" "}
        <div className="flex">
          <button onClick={() => navigate("/")}>
            <img
              src={BackBtn}
              alt="Add Group Icon"
              className="h-[40px] hover:scale-110 transition mt-1 mr-4"
            />
          </button>{" "}
          <div>"{group.title}"</div>{" "}
        </div>
      </h1>
      <p className="text-lg">Group Cost: ${group.group_cost}</p>
      <p className="text-lg">Number of Students: {group.students.length}</p>
      <p className="text-lg">Group ID: {group.id}</p>
      <table className="min-w-full bg-white mt-6">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Student ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Payment Day</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Parent Phone Number</th>
            <th className="py-2 px-4 border-b">Cost</th>
            <th className="py-2 px-4 border-b">Paid Amount</th>
          </tr>
        </thead>
        <tbody>
          {group.students.map((student) => (
            <tr key={student.id}>
              <td className="py-2 px-4 border-b">{student.id}</td>
              <td className="py-2 px-4 border-b">{student.name}</td>
              <td className="py-2 px-4 border-b">{student.payment_day}</td>
              <td className="py-2 px-4 border-b">{student.status}</td>
              <td className="py-2 px-4 border-b">
                {student.parent_phone_number}
              </td>
              <td className="py-2 px-4 border-b">{student.cost}</td>
              <td className="py-2 px-4 border-b">{student.paid_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupDetails;
