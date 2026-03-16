import React, { useState } from "react";

const StudentNoDues = () => {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    department: "",
    year: "",
    libraryDues: "",
    labDues: "",
    hostelDues: "",
    subjects: [
      { subjectName: "", facultyName: "", labWork: "", assignment: "" },
    ],
    majorProjectTitle: "",
    majorProjectStatus: "",
    projectGuide: "",
  });

  const [message, setMessage] = useState("");

  // Handle normal input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle subject change
  const handleSubjectChange = (index, e) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index][e.target.name] = e.target.value;
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  // Add new subject row
  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        { subjectName: "", facultyName: "", labWork: "", assignment: "" },
      ],
    });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Form Submitted Successfully ✅");
    console.log(formData);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Student No Dues Form</h2>

        <form onSubmit={handleSubmit}>
          {/* Basic Details */}
          <input name="name" placeholder="Student Name" onChange={handleChange} style={styles.input} />
          <input name="rollNo" placeholder="Roll Number" onChange={handleChange} style={styles.input} />
          <input name="department" placeholder="Department" onChange={handleChange} style={styles.input} />
          <input name="year" placeholder="Year" onChange={handleChange} style={styles.input} />

          <input type="number" name="libraryDues" placeholder="Library Dues (₹)" onChange={handleChange} style={styles.input} />
          <input type="number" name="labDues" placeholder="Lab Dues (₹)" onChange={handleChange} style={styles.input} />
          <input type="number" name="hostelDues" placeholder="Hostel Dues (₹)" onChange={handleChange} style={styles.input} />

          {/* SUBJECT SECTION */}
          <h3 style={styles.sectionTitle}>Subjects Clearance</h3>

          {formData.subjects.map((subject, index) => (
            <div key={index} style={styles.subjectBox}>
              <input
                name="subjectName"
                placeholder="Subject Name"
                value={subject.subjectName}
                onChange={(e) => handleSubjectChange(index, e)}
                style={styles.input}
              />

              <input
                name="facultyName"
                placeholder="Subject Faculty Name"
                value={subject.facultyName}
                onChange={(e) => handleSubjectChange(index, e)}
                style={styles.input}
              />

              <select
                name="labWork"
                value={subject.labWork}
                onChange={(e) => handleSubjectChange(index, e)}
                style={styles.input}
              >
                <option value="">Lab Work Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                name="assignment"
                value={subject.assignment}
                onChange={(e) => handleSubjectChange(index, e)}
                style={styles.input}
              >
                <option value="">Assignment Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          ))}

          <button type="button" onClick={addSubject} style={styles.addButton}>
            + Add Another Subject
          </button>

          {/* MAJOR PROJECT SECTION */}
          <h3 style={styles.sectionTitle}>Major Project Clearance</h3>

          <input
            name="majorProjectTitle"
            placeholder="Project Title"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="projectGuide"
            placeholder="Project Guide Name"
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="majorProjectStatus"
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Project Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <button type="submit" style={styles.submitBtn}>
            Submit No Dues Form
          </button>

          {message && <p style={styles.success}>{message}</p>}
        </form>
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
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    textAlign: "left",
  },
  subjectBox: {
    backgroundColor: "#f1f1f1",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
  },
  addButton: {
    marginBottom: "20px",
    padding: "8px 12px",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
};

export default StudentNoDues;