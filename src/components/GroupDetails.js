import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { usePermissions } from "./usePermissions";
import BackBtn from "../assets/BackButton.svg";
import addUserBtn from "../assets/addUser.svg";
import removeUserBtn from "../assets/removeUser.svg";
import config from "../config";

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groupCost, setGroupCost] = useState("");
  const [editedStudents, setEditedStudents] = useState([]);
  const [studentPaymentStatus, setStudentPaymentStatus] = useState({});
  const [studentPendingAmount, setStudentPendingAmount] = useState({});

  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { hasPermission } = usePermissions(); // Use the custom hook
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "https://studenttrackapi.com",
        });

        const groupResponse = await axios.get(
          `${config.API_URL}/api/groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGroup(groupResponse.data);
        setGroupCost(groupResponse.data.group_cost);
        setEditedStudents(groupResponse.data.students);
        setLoading(false);

        const paymentStatusPromises = groupResponse.data.students.map(
          (student) =>
            axios.get(
              `${config.API_URL}/api/students/${student.id}/payment_status`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
        );

        const paymentStatusResponses = await Promise.all(paymentStatusPromises);
        const newStudentPaymentStatus = {};
        const newStudentPendingAmount = {};

        paymentStatusResponses.forEach((response, index) => {
          newStudentPaymentStatus[groupResponse.data.students[index].id] =
            response.data.status;
          newStudentPendingAmount[groupResponse.data.students[index].id] =
            response.data.pending_amount;
        });

        setStudentPaymentStatus(newStudentPaymentStatus);
        setStudentPendingAmount(newStudentPendingAmount);
      } catch (error) {
        console.error(
          "There was an error fetching the group details and payment status!",
          error
        );
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id, getAccessTokenSilently]);

  const handleDelete = async () => {
    if (group.students.length > 0) {
      setShowPopup(true);
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "https://studenttrackapi.com",
      });

      await axios.delete(`${config.API_URL}/api/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (error) {
      console.error("There was an error deleting the group!", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://studenttrackapi.com",
      });

      const response = await axios.patch(
        `${config.API_URL}/api/groups/${id}`,
        {
          group_cost: parseInt(groupCost),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroup(response.data);
      setIsEditing(false);

      // Remove students from group
      const removedStudents = group.students.filter(
        (student) =>
          !editedStudents.some(
            (editedStudent) => editedStudent.id === student.id
          )
      );

      await Promise.all(
        removedStudents.map((student) =>
          axios.delete(
            `${config.API_URL}/api/groups/${id}/students/${student.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setGroup((prevGroup) => ({
        ...prevGroup,
        students: editedStudents,
      }));
    } catch (error) {
      console.error("There was an error updating the group!", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setGroupCost(group.group_cost);
    setEditedStudents(group.students);
  };

  const handleRemoveStudent = (studentId) => {
    setEditedStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== studentId)
    );
  };

  const handleStudentClick = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center text-xl">Group not found</div>;
  }

  return (
    <div>
      <h1 className="text-5xl align-bottom justify-between flex font-bold mb-6 text-[#2F4858]">
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
        <div className="flex gap-4 text-base">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#55E0A6] text-[#007242] hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                SAVE
              </button>{" "}
              <button
                onClick={handleCancel}
                className="bg-[#AEC8DB] text-[#2F4858] hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                CANCEL
              </button>
            </>
          ) : (
            <>
              {hasPermission("patch:group") && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#AEC8DB] text-[#2F4858] hover:scale-110 transition h-fit rounded-md py-2 px-4"
                >
                  EDIT
                </button>
              )}
              {hasPermission("delete:group") && (
                <button
                  onClick={handleDelete}
                  className="bg-[#F26419] text-[#FFDB9B] hover:scale-110 transition h-fit rounded-md py-2 px-4"
                >
                  DELETE
                </button>
              )}
            </>
          )}
        </div>
      </h1>
      <div className="border-2 relative z-10 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg  shadow-sm">
        <p className="text-lg mb-4 flex justify-between">
          <div> Group Cost:</div>{" "}
          {isEditing ? (
            <input
              type="number"
              value={groupCost}
              onChange={(e) => setGroupCost(e.target.value)}
              className="border-b-2 border-[#69A1CB] rounded w-24 py-1 px-2 text-gray-700 focus:outline-none focus:border-[#F26419]"
            />
          ) : (
            <div className="font-bold text-xl text-[#F26419]">
              {" "}
              ${group.group_cost}{" "}
            </div>
          )}
        </p>
        <p className="text-lg mb-4 flex justify-between">
          <div> Number of Students: </div>{" "}
          <div className="font-bold"> {group.students.length} </div>
        </p>
        <p className="text-lg mb-4 flex justify-between">
          <div> Group ID:</div> <div className="font-bold"> {group.id}</div>
        </p>
        <table className="min-w-full bg-[#DEE9F1] mt-6 relative">
          <thead>
            <tr className="bg-[#33658A] text-white">
              <th className="py-2 px-4 border-b font-normal text-left">
                Student ID
              </th>
              <th className="py-2 px-4 border-b font-normal text-left">
                Student Name
              </th>
              <th className="py-2 px-4 border-b font-normal text-left">
                This Month Status
              </th>
              <th className="py-2 px-4 border-b text-left font-normal">
                Pending Payment
              </th>
            </tr>
          </thead>
          <tbody>
            {editedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-[#c4d6e4]">
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.id}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  <div
                    onClick={() => handleStudentClick(student.id)}
                    className="transition hover:cursor-pointer"
                  >
                    {student.name}
                  </div>
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {studentPaymentStatus[student.id] || "Loading..."}
                </td>
                <td className="py-2 flex justify-between px-4 border-b  border-[#69A1CB] text-center">
                  ${studentPendingAmount[student.id] || 0}
                  {isEditing ? (
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="transition hover:scale-105"
                    >
                      <img
                        src={removeUserBtn}
                        className="w-[20px]"
                        alt="Remove user icon"
                      />
                    </button>
                  ) : (
                    <div></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {isEditing ? (
            <button onClick={() => navigate("/students")}>
              <img
                src={addUserBtn}
                alt="Decorative SVG"
                className="absolute -bottom-4 -right-4 w-[50px] transition hover:scale-105 z-0"
              />
            </button>
          ) : (
            <div></div>
          )}
        </table>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 w-[400px] rounded-lg shadow-lg">
            <p className="text-lg text-center">
              You must manually remove Students associated with this group
              before Deleting.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-[#AEC8DB] text-[#2F4858] font-semibold hover:bg-[#98b8cf] w-full py-2 px-4 rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
