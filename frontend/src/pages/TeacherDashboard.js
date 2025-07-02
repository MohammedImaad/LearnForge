import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username"); // ✅ Move it outside useEffect

  useEffect(() => {
    if (!username) return;

    console.log("Username in TeacherDashboard:", username);

    fetch(`${API_BASE_URL}/courses/by-author?author=${username}`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error loading courses:", err));
  }, [username]);

  const handleCreate = () => {
    navigate("/create-course");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {username}</h1>
      <h2>Your Courses</h2>
      <ul>
        {courses.map(course => (
          <li key={course._id}>{course.title}</li>
        ))}
      </ul>
      <button onClick={handleCreate}>+ Create New Course</button>
    </div>
  );
};

export default TeacherDashboard;
