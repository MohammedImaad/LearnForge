import React, { useState } from "react";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const CreateCourse = ({ username }) => {
  const [title, setTitle] = useState("");
  const [courseData, setCourseData] = useState(""); // Paste full JSON here
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author: username,
          course_data: JSON.parse(courseData)
        })
      });

      const result = await res.json();
      if (result.message === "Course saved") {
        alert("Course created!");
        navigate("/dashboard");
      } else {
        alert("Error saving course");
      }
    } catch (e) {
      alert("Invalid JSON or API error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create New Course</h2>
      <input
        placeholder="Course Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      /><br /><br />
      <textarea
        placeholder="Paste generated course JSON here"
        rows={10}
        cols={50}
        value={courseData}
        onChange={e => setCourseData(e.target.value)}
      /><br /><br />
      <button onClick={handleSubmit}>Save Course</button>
    </div>
  );
};

export default CreateCourse;
