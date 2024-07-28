import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BackBtn from "../assets/BackButton.svg";
import xIcon from "../assets/close-circle-svgrepo-com 1.svg";
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
  const [showAddGroupPopup, setShowAddGroupPopup] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showConfirmDeletePopup, setShowConfirmDeletePopup] = useState(false);
  const [showAddPaymentPopup, setShowAddPaymentPopup] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [hoveredPaymentId, setHoveredPaymentId] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showConfirmDeletePaymentPopup, setShowConfirmDeletePaymentPopup] =
    useState(false);

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

  const handleConfirmDelete = () => {
    axios
      .delete(
        `http://127.0.0.1:5000/api/groups/${groupToDelete.id}/students/${student.id}`
      )
      .then(() => {
        setStudent({
          ...student,
          groups: student.groups.filter(
            (group) => group.id !== groupToDelete.id
          ),
        });
        setShowConfirmDeletePopup(false);
        setIsDeleteMode(false);
      })
      .catch((error) => {
        console.error(
          "There was an error removing the student from the group!",
          error
        );
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

  const handleAddGroup = () => {
    axios
      .get("http://127.0.0.1:5000/api/groups")
      .then((response) => {
        const allGroups = response.data;
        const studentGroupIds = student.groups.map((g) => g.id);
        const filteredGroups = allGroups.filter(
          (group) => !studentGroupIds.includes(group.id)
        );
        setAvailableGroups(filteredGroups);
        setShowAddGroupPopup(true);
      })
      .catch((error) => {
        console.error("There was an error fetching the groups!", error);
      });
  };

  const handleSelectGroup = (groupId) => {
    axios
      .post(`http://127.0.0.1:5000/api/groups/${groupId}/students`, {
        student_id: student.id,
      })
      .then(() => {
        return axios.get(`http://127.0.0.1:5000/api/students/${id}`);
      })
      .then((response) => {
        const updatedStudent = response.data;
        updatedStudent.payments = updatedStudent.payments || [];
        updatedStudent.groups = updatedStudent.groups || [];
        setStudent(updatedStudent);
        setShowAddGroupPopup(false);
      })
      .catch((error) => {
        console.error(
          "There was an error updating the student information!",
          error
        );
      });
  };

  const handleConfirmPayment = () => {
    axios
      .post(`http://127.0.0.1:5000/api/students/${id}/payments`, {
        amount: newPaymentAmount,
      })
      .then((response) => {
        setStudent((prevStudent) => ({
          ...prevStudent,
          payments: [...prevStudent.payments, response.data],
        }));
        setShowAddPaymentPopup(false);
        setNewPaymentAmount("");
      })
      .catch((error) => {
        console.error("There was an error adding the payment!", error);
      });
  };

  const handleAddPayment = () => setShowAddPaymentPopup(true);

  const handleClosePopup = () => {
    setShowAddGroupPopup(false);
  };

  const handleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
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
      {showAddPaymentPopup && (
        <div className="fixed z-10 inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="mb-4 font-semibold text-xl">Add Payment</h2>
            <input
              type="number"
              value={newPaymentAmount}
              onChange={(e) => setNewPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="border-2 border-gray-300 rounded p-2 mb-4 w-full"
            />
            <div className="w-full flex">
              <button
                onClick={handleConfirmPayment}
                className="bg-blue-500 text-white w-1/2 py-2 px-4 rounded mr-4"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddPaymentPopup(false)}
                className="bg-gray-500 text-white w-1/2 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDeletePopup && (
        <div className="fixed z-10 inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 w-[500px] rounded-lg shadow-lg text-center">
            <p className="mb-6">
              Are you sure you want to remove {student.name} from the group: "
              {groupToDelete?.title}"?
            </p>
            <div className="w-full flex">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white w-1/2 py-2 px-4 rounded mr-4"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDeletePopup(false)}
                className="bg-gray-500 w-1/2 text-white py-2 px-4 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddGroupPopup && (
        <div className="fixed z-10 inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 text-[#2F4858] rounded-lg shadow-lg relative">
            <button
              className="absolute w-[35px] -top-3 -right-3"
              onClick={handleClosePopup}
            >
              <img src={xIcon}></img>
            </button>
            <h2 className="mb-4 font-semibold text-xl">Available Groups:</h2>
            <ul>
              {availableGroups.length === 0 ? (
                <li>No available groups</li>
              ) : (
                availableGroups.map((group) => (
                  <li
                    key={group.id}
                    className="cursor-pointer border-2 mb-2 pl-4 border-[#69A1CB] hover:scale-105 transition min-w-[300px] list-disc list-inside p-2 rounded-lg"
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    {group.title}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {showConfirmDeletePaymentPopup && (
        <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="mb-4">
              Are you sure you want to delete this payment of $
              {paymentToDelete?.amount} made on{" "}
              {new Date(paymentToDelete?.date).toLocaleString()}?
            </p>
            <div className="flex w-full">
              <button
                onClick={handleDeletePayment}
                className="bg-red-500 text-white w-1/2 py-2 px-4 rounded mr-4"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDeletePaymentPopup(false)}
                className="bg-gray-500 text-white w-1/2 py-2 px-4 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-5xl align-bottom justify-between flex font-bold mb-6 text-[#2F4858]">
        <div className="flex w-full">
          <button onClick={() => navigate("/students")}>
            <img
              src={BackBtn}
              alt="Back Button"
              className="h-[40px] hover:scale-110 transition mt-1 mr-4"
            />
          </button>
          <div className="w-full pr-6">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b-2 border-[#69A1CB] w-full text-3xl rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-[#F26419]"
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
      <div className="flex gap-6 text-[#2F4858]">
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
          {!isEditing ? (
            <div>
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
                <div className=" mt-4 mb-2">
                  Belongs to the following Groups:
                </div>
                {student.groups.length === 0 ? (
                  <div className="w-full bg-[#DEE9F1] text-sm flex justify-center text-[#2F4858]/50 min-h-[50px] rounded-lg p-4">
                    This Student is not enrolled in any group
                  </div>
                ) : (
                  <ul className="w-full bg-[#DEE9F1] text-sm flex gap-2 min-h-[50px] rounded-lg p-4">
                    {student.groups.map((group) => (
                      <li
                        key={group.id}
                        className="bg-white p-2 shadow-md rounded-full relative"
                      >
                        {group.title}
                        {isDeleteMode && (
                          <button
                            onClick={() => {
                              setGroupToDelete(group);
                              setShowConfirmDeletePopup(true);
                            }}
                            className="absolute hover:scale-105 transition -top-2 w-[25px] -right-2"
                          >
                            <img src={xIcon}></img>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </p>
              {isDeleteMode ? (
                <div className="flex w-full gap-4 justify-between">
                  <button
                    onClick={() => {
                      setIsDeleteMode(false);
                      setGroupToDelete(null);
                    }}
                    className="w-full font-semibold bg-[#AEC8DB] text-[#2F4858] hover:bg-[#8daabe] transition rounded-lg py-2"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div className="flex w-full gap-4 justify-between">
                  <button
                    onClick={handleAddGroup}
                    className="w-1/2 bg-[#55DDE0] hover:scale-105 transition py-2 rounded-lg"
                  >
                    Add to Group
                  </button>
                  <button
                    onClick={handleDeleteMode}
                    className="w-1/2 bg-[#F26419] hover:scale-105 transition rounded-lg text-white"
                  >
                    Remove From Groups
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div></div>
          )}
        </div>
        {isEditing ? (
          <div></div>
        ) : (
          <div className="border-2 relative w-1/2 flex flex-col border-[#69A1CB] backdrop-blur-lg bg-white/50 rounded-lg shadow-sm">
            <h2 className="text-2xl text-white font-semibold bg-gradient-to-r p-3 px-6 from-[#69A1CB] to-[#55DDE0]">
              Payments
            </h2>
            <div className="flex flex-col grow p-6">
              <div className=" mb-4 grow bg-[#DEE9F1] h-[200px] overflow-auto rounded-md">
                {student.payments.length === 0 ? (
                  <p className="m-4">No payments recorded.</p>
                ) : (
                  <ul>
                    {student.payments.map((payment) => (
                      <li
                        key={payment.id}
                        onMouseEnter={() => setHoveredPaymentId(payment.id)}
                        onMouseLeave={() => setHoveredPaymentId(null)}
                        className={`relative flex px-6 justify-between border-b border-gray-300 py-2 ${
                          hoveredPaymentId === payment.id
                            ? "bg-[#2F4858]/20"
                            : ""
                        }`}
                      >
                        <span>${payment.amount}</span>
                        <span>{new Date(payment.date).toLocaleString()}</span>
                        {hoveredPaymentId === payment.id && (
                          <button
                            onClick={() => {
                              setPaymentToDelete(payment);
                              setShowConfirmDeletePaymentPopup(true);
                            }}
                            className="absolute right-1/2 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-white font-semibold"
                          >
                            DELETE
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={handleAddPayment}
                className="w-full bg-[#55DDE0] hover:scale-105 transition py-2 rounded-lg"
              >
                Add Payment
              </button>
            </div>
          </div>
        )}
      </div>
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="mb-4">
              Are you sure you want to delete this student?
            </p>
            <div className="flex w-full">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white w-1/2 py-2 px-4 rounded mr-4"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="bg-gray-500 text-white w-1/2 py-2 px-4 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
