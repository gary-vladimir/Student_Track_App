import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../assets/BackButton.svg";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [parentPhoneNumber, setParentPhoneNumber] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/api/students/${id}`)
      .then((response) => {
        const studentData = response.data;
        // Ensure default values
        studentData.payments = studentData.payments || [];
        studentData.groups = studentData.groups || [];
        setStudent(studentData);
        setName(studentData.name);
        setParentPhoneNumber(studentData.parent_phone_number);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the student details!",
          error
        );
      });
  }, [id]);

  const handleDelete = () => {
    axios
      .delete(`http://127.0.0.1:5000/api/students/${id}`)
      .then((response) => {
        navigate("/students");
      })
      .catch((error) => {
        console.error("There was an error deleting the student!", error);
      });
  };

  const handleSave = () => {
    const updatedStudent = {
      name,
      parent_phone_number: parentPhoneNumber,
      payments: student.payments || [],
      groups: student.groups || [],
    };

    axios
      .patch(`http://127.0.0.1:5000/api/students/${id}`, updatedStudent)
      .then((response) => {
        const updatedData = response.data;
        updatedData.payments = updatedData.payments || [];
        updatedData.groups = updatedData.groups || [];
        setStudent(updatedData);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("There was an error updating the student!", error);
      });
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center text-xl">Student not found</div>;
  }
  const formattedPhoneNumber = parsePhoneNumberFromString(
    parentPhoneNumber.startsWith("+")
      ? parentPhoneNumber
      : `+${parentPhoneNumber}`
  );

  return (
    <div>
      <h1 className="text-5xl align-bottom justify-between flex font-bold mb-6 text-[#2F4858]">
        <div className="flex">
          <button onClick={() => navigate("/students")}>
            <img
              src={BackBtn}
              alt="Back Button"
              className="h-[40px] hover:scale-110 transition mt-1 mr-4"
            />
          </button>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b-2 border-[#69A1CB] rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#F26419]"
              />
            ) : (
              student.name
            )}
          </div>
        </div>
        <div className="flex gap-4 text-base">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#69A1CB] text-white hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                SAVE
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(student.name);
                  setParentPhoneNumber(student.parent_phone_number);
                }}
                className="bg-gray-500 text-white hover:scale-110 transition h-fit rounded-md py-2 px-4"
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
              </button>
              <button
                onClick={() => setShowConfirmPopup(true)}
                className="bg-[#F26419] text-[#FFDB9B] hover:scale-110 transition h-fit rounded-md py-2 px-4"
              >
                DELETE
              </button>
            </>
          )}
        </div>
      </h1>
      <div className="flex gap-6">
        <div className="border-2 relative w-1/2 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg shadow-sm">
          <p className="text-lg mb-4 flex justify-between">
            <div>Student ID:</div>
            <div className="font-bold">{student.id}</div>
          </p>

          <p className="text-lg mb-4 flex justify-between">
            <div>Tutor Phone Number:</div>
            {isEditing ? (
              <div>
                <PhoneInput
                  country={"us"}
                  value={parentPhoneNumber}
                  onChange={(phone) => setParentPhoneNumber(phone)}
                  required
                />
              </div>
            ) : (
              <div className="font-bold">
                {formattedPhoneNumber
                  ? formattedPhoneNumber.formatInternational()
                  : "Undefined or Invalid Phone Number"}
              </div>
            )}
          </p>
          <p className="text-lg mb-4 flex justify-between">
            <div>This Month Status:</div>
            <div className="font-bold">PENDING</div>
          </p>
          <p className="text-lg mb-4 flex justify-between">
            <div>Pending Paying Amount:</div>
            <div className="font-bold">$600</div>
          </p>
          <div className="h-[2px] w-full bg-[#AECFE4]"></div>
          <p className="text-lg mb-4">
            <div className="font-bold">Groups:</div>
            {student.groups.length === 0 ? (
              <div>No groups found</div>
            ) : (
              <ul>
                {student.groups.map((group) => (
                  <li key={group.id} className="ml-4 list-disc">
                    {group.title}
                  </li>
                ))}
              </ul>
            )}
          </p>
        </div>
        <div className="border-2 relative w-1/2 border-[#69A1CB] p-8 backdrop-blur-lg bg-white/50 rounded-lg shadow-sm">
          payments
        </div>
      </div>
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="mb-4">
              Are you sure you want to delete this student?
            </p>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded mr-4"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirmPopup(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
