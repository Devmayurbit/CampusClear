import React, { useState, useEffect } from "react";

const DepartmentApproval = () => {
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState("");

  const [approval, setApproval] = useState({
    projectStatus: "",
    projectRemark: "",
    hodStatus: "",
    hodRemark: "",
    feesStatus: "",
    feesRemark: "",
  });

  // Dummy student data (Replace with backend later)
  useEffect(() => {
    const dummyStudent = {
      name: "Rahul Sharma",
      rollNo: "CS2021001",
      department: "Computer Science",
      year: "4th Year",
    };

    setStudentData(dummyStudent);
  }, []);

  const handleChange = (field, value) => {
    setApproval({
      ...approval,
      [field]: value,
    });
  };

  const handleFinalSubmit = () => {
    if (
      !approval.projectStatus ||
      !approval.hodStatus ||
      !approval.feesStatus
    ) {
      setMessage("Please complete all approval sections.");
      return;
    }

    const isRejected =
      approval.projectStatus === "Rejected" ||
      approval.hodStatus === "Rejected" ||
      approval.feesStatus === "Rejected";

    const finalStatus = isRejected ? "Rejected ❌" : "Fully Approved ✅";

    setMessage(`Final Status: ${finalStatus}`);

    console.log({
      student: studentData,
      approvalData: approval,
      finalStatus: finalStatus,
    });

    // Later connect backend here
  };

  if (!studentData) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Department Final Approval</h2>

        {/* Student Info */}
        <div style={styles.detailsBox}>
          <p><strong>Name:</strong> {studentData.name}</p>
          <p><strong>Roll No:</strong> {studentData.rollNo}</p>
          <p><strong>Department:</strong> {studentData.department}</p>
          <p><strong>Year:</strong> {studentData.year}</p>
        </div>

        {/* Major Project Approval */}
        <h3>Major Project Approval (Coordinator)</h3>
        <select
          style={styles.select}
          onChange={(e) => handleChange("projectStatus", e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <textarea
          placeholder="Project Remark"
          style={styles.textarea}
          onChange={(e) => handleChange("projectRemark", e.target.value)}
        />

        {/* HOD Approval */}
        <h3>HOD Approval</h3>
        <select
          style={styles.select}
          onChange={(e) => handleChange("hodStatus", e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <textarea
          placeholder="HOD Remark"
          style={styles.textarea}
          onChange={(e) => handleChange("hodRemark", e.target.value)}
        />

        {/* Fees Clearance */}
        <h3>Fees Clearance Approval</h3>
        <select
          style={styles.select}
          onChange={(e) => handleChange("feesStatus", e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <textarea
          placeholder="Fees Remark"
          style={styles.textarea}
          onChange={(e) => handleChange("feesRemark", e.target.value)}
        />

        <button style={styles.submitBtn} onClick={handleFinalSubmit}>
          Submit Final Approval
        </button>

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
    backgroundColor: "#eef2f7",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  select: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    height: "70px",
    padding: "8px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  submitBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontWeight: "bold",
  },
};

export default DepartmentApproval;