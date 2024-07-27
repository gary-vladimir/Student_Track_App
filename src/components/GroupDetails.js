import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../assets/BackButton.svg";
import addUserBtn from "../assets/addUser.svg";
import removeUserBtn from "../assets/removeUser.svg";

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groupCost, setGroupCost] = useState("");
  const [editedStudents, setEditedStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/api/groups/${id}`)
      .then((response) => {
        setGroup(response.data);
        setGroupCost(response.data.group_cost);
        setEditedStudents(response.data.students);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the group details!", error);
      });
  }, [id]);

  const handleDelete = () => {
    if (group.students.length > 0) {
      setShowPopup(true);
      return;
    }

    axios
      .delete(`http://127.0.0.1:5000/api/groups/${id}`)
      .then((response) => {
        console.log(response.data);
        navigate("/");
      })
      .catch((error) => {
        console.error("There was an error deleting the group!", error);
      });
  };

  const handleSave = () => {
    axios
      .patch(`http://127.0.0.1:5000/api/groups/${id}`, {
        group_cost: parseInt(groupCost),
      })
      .then((response) => {
        setGroup(response.data);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("There was an error updating the group cost!", error);
      });

    // Remove students from group
    const removedStudents = group.students.filter(
      (student) =>
        !editedStudents.some((editedStudent) => editedStudent.id === student.id)
    );
    removedStudents.forEach((student) => {
      axios
        .delete(`http://127.0.0.1:5000/api/groups/${id}/students/${student.id}`)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(
            "There was an error removing the student from the group!",
            error
          );
        });
    });

    setGroup((prevGroup) => ({
      ...prevGroup,
      students: editedStudents,
    }));
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
    navigate(`/students/${studentId}`);
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
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#AEC8DB] text-[#2F4858] hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                EDIT
              </button>{" "}
              <button
                onClick={handleDelete}
                className="bg-[#F26419] text-[#FFDB9B] hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                DELETE
              </button>
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
              <tr key={student.id}>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.id}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  {student.name}
                </td>
                <td className="py-2 px-4 border-b  border-[#69A1CB]">
                  PENDING
                </td>
                <td className="py-2 flex justify-between px-4 border-b  border-[#69A1CB] text-center">
                  $0
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
