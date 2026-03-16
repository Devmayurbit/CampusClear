import React, { useState, useEffect } from "react";

const FacultyVerification = () => {
  const [studentData, setStudentData] = useState(null);
  const [remark, setRemark] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [message, setMessage] = useState("");

  // Dummy Data (Replace with API later)
  useEffect(() => {
    const dummyStudent = {
      name: "Rahul Sharma",
      rollNo: "CS2021001",
      department: "Computer Science",
      year: "4th Year",
      subjects: [
        {
          subjectName: "DBMS",
          assignmentSubmitted: "",
          labFileSubmitted: "",
          labFileChecked: "",
        },
        {
          subjectName: "Operating System",
          assignmentSubmitted: "",
          labFileSubmitted: "",
          labFileChecked: "",
        },
      ],
    };

    setStudentData(dummyStudent);
  }, []);

  // Handle subject status change
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...studentData.subjects];
    updatedSubjects[index][field] = value;

    setStudentData({
      ...studentData,
      subjects: updatedSubjects,
    });
  };

  // Approve or Reject
  const handleFinalDecision = (status) => {
    if (!remark) {
      setMessage("Please add remarks before submitting.");
      return;
    }

    setFinalStatus(status);
    setMessage(`Student ${status} Successfully ✅`);

    console.log({
      student: studentData,
      finalStatus: status,
      remark: remark,
    });

    // Later connect backend here
  };

  if (!studentData) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Faculty Verification Page</h2>

        {/* Student Details */}
        <div style={styles.detailsBox}>
          <p><strong>Name:</strong> {studentData.name}</p>
          <p><strong>Roll No:</strong> {studentData.rollNo}</p>
          <p><strong>Department:</strong> {studentData.department}</p>
          <p><strong>Year:</strong> {studentData.year}</p>
        </div>

        {/* Subject Verification Section */}
        <h3 style={styles.sectionTitle}>Subject Verification</h3>

        {studentData.subjects.map((subject, index) => (
          <div key={index} style={styles.subjectBox}>
            <h4>{subject.subjectName}</h4>

            <label>Assignment Submitted:</label>
            <select
              value={subject.assignmentSubmitted}
              onChange={(e) =>
                handleSubjectChange(index, "assignmentSubmitted", e.target.value)
              }
              style={styles.select}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label>Lab File Submitted:</label>
            <select
              value={subject.labFileSubmitted}
              onChange={(e) =>
                handleSubjectChange(index, "labFileSubmitted", e.target.value)
              }
              style={styles.select}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label>Lab File Checked:</label>
            <select
              value={subject.labFileChecked}
              onChange={(e) =>
                handleSubjectChange(index, "labFileChecked", e.target.value)
              }
              style={styles.select}
            >
              <option value="">Select</option>
              <option value="Checked">Checked</option>
              <option value="Not Checked">Not Checked</option>
            </select>
          </div>
        ))}

        {/* Remarks */}
        <textarea
          placeholder="Enter remarks..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          style={styles.textarea}
        />

        {/* Approve / Reject Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={styles.approveBtn}
            onClick={() => handleFinalDecision("Approved")}
          >
            Approve
          </button>

          <button
            style={styles.rejectBtn}
            onClick={() => handleFinalDecision("Rejected")}
          >
            Reject
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "600px",
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  detailsBox: {
    backgroundColor: "#f1f1f1",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  sectionTitle: {
    marginBottom: "10px",
  },
  subjectBox: {
    backgroundColor: "#eef2f7",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  select: {
    width: "100%",
    padding: "6px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "8px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
  approveBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  rejectBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontWeight: "bold",
  },
};

export default FacultyVerification;