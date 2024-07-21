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
      <div className="border-2 relative z-10 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg  shadow-sm">
        <p className="text-lg mb-4 flex justify-between">
          <div> Group Cost:</div>{" "}
          <div className="font-bold text-xl text-[#F26419]">
            {" "}
            ${group.group_cost}{" "}
          </div>
        </p>
        <p className="text-lg mb-4 flex justify-between">
          <div> Number of Students: </div>{" "}
          <div className="font-bold"> {group.students.length} </div>
        </p>
        <p className="text-lg mb-4 flex justify-between">
          <div> Group ID:</div> <div className="font-bold"> {group.id}</div>
        </p>
        <table className="min-w-full bg-[#DEE9F1] mt-6">
          <thead>
            <tr className="bg-[#33658A] text-white">
              <th className="py-2 px-4 border-b font-normal text-left">
                Student ID
              </th>
              <th className="py-2 px-4 border-b font-normal text-left">
                Student Name
              </th>
              <th className="py-2 px-4 border-b font-normal text-left">
                Status
              </th>
              <th className="py-2 px-4 border-b font-normal">
                Pending Payment
              </th>
            </tr>
          </thead>
          <tbody>
            {group.students.map((student) => (
              <tr key={student.id}>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.id}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.name}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.status}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB] text-center">
                  {student.paid_amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupDetails;
