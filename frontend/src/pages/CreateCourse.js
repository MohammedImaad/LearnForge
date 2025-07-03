import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("kids aged 8–14");
  const [weeks, setWeeks] = useState(1);
  const [slidesPerWeek, setSlidesPerWeek] = useState(6);
  const [objectives, setObjectives] = useState([""]);
  const [prompts, setPrompts] = useState([""]);
  const [resources, setResources] = useState([""]);
  const [generatedCourse, setGeneratedCourse] = useState(null);

  const navigate = useNavigate();

  const addField = (setter, values) => {
    setter([...values, ""]);
  };

  const updateField = (setter, values, index, value) => {
    const updated = [...values];
    updated[index] = value;
    setter(updated);
  };

  const handleGenerate = async () => {
  const payload = {
    topic,
    audience,
    weeks,
    slides_per_week: slidesPerWeek,
    objectives: objectives.filter(obj => obj.trim() !== ""),
    prompts: prompts.filter(p => p.trim() !== ""),
    resources: resources.filter(r => r.trim() !== "")
  };

  try {
    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log("✅ AI Generated Course:\n", data);
      setGeneratedCourse(data); 

    } else {
      console.error("❌ Error from backend:", data);
      alert("❌ Failed to generate course. Check console.");
    }
  } catch (error) {
    console.error("❌ Network or server error:", error);
    alert("❌ Error connecting to backend.");
  }
};


  const sectionStyle = { marginBottom: "2rem" };
  const labelStyle = { fontWeight: "bold", marginBottom: "0.5rem", display: "block" };
  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    marginBottom: "0.8rem",
    borderRadius: "8px",
    border: "1px solid #ccc"
  };
  const buttonStyle = {
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "1rem"
  };
  const containerStyle = {
    maxWidth: "800px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "2rem" }}>🛠️ Create a New Course</h1>

      <div style={sectionStyle}>
        <label style={labelStyle}>Topic</label>
        <input
          style={inputStyle}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Intro to HTML"
        />

        <label style={labelStyle}>Audience</label>
        <input
          style={inputStyle}
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder="e.g. kids aged 8–14"
        />

        <label style={labelStyle}>Number of Weeks</label>
        <input
          style={inputStyle}
          type="number"
          value={weeks}
          min={1}
          onChange={e => setWeeks(Number(e.target.value))}
        />

        <label style={labelStyle}>Slides per Week</label>
        <input
          style={inputStyle}
          type="number"
          value={slidesPerWeek}
          min={1}
          onChange={e => setSlidesPerWeek(Number(e.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Weekly Objectives</label>
        {objectives.map((obj, i) => (
          <input
            key={i}
            style={inputStyle}
            value={obj}
            onChange={e => updateField(setObjectives, objectives, i, e.target.value)}
            placeholder={`Objective ${i + 1}`}
          />
        ))}
        <button style={buttonStyle} onClick={() => addField(setObjectives, objectives)}>+ Add Objective</button>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Prompts for AI</label>
        {prompts.map((prompt, i) => (
          <input
            key={i}
            style={inputStyle}
            value={prompt}
            onChange={e => updateField(setPrompts, prompts, i, e.target.value)}
            placeholder={`Prompt ${i + 1}`}
          />
        ))}
        <button style={buttonStyle} onClick={() => addField(setPrompts, prompts)}>+ Add Prompt</button>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Additional Resources</label>
        {resources.map((res, i) => (
          <input
            key={i}
            style={inputStyle}
            value={res}
            onChange={e => updateField(setResources, resources, i, e.target.value)}
            placeholder={`Resource ${i + 1}`}
          />
        ))}
        <button style={buttonStyle} onClick={() => addField(setResources, resources)}>+ Add Resource</button>
      </div>

      <button style={{ ...buttonStyle, backgroundColor: "#007bff" }} onClick={handleGenerate}>
  🚀 Generate Course
</button>

{generatedCourse && (
  <div style={{ marginTop: "3rem", padding: "1rem", background: "#f9f9f9", borderRadius: "8px" }}>
    <h2>📝 Edit Generated Course</h2>

    {Object.entries(generatedCourse).map(([weekKey, weekData], weekIndex) => (
      <div key={weekKey} style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#007bff" }}>
          📅 {weekKey.toUpperCase()} — {weekData.objectives}
        </h3>

        {weekData.slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            style={{
              background: "#fff",
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px"
            }}
          >
            {"title" in slide && (
              <>
                <label><b>Title</b></label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].title = e.target.value;
                    setGeneratedCourse(updated);
                  }}
                  style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                />
              </>
            )}

            {"explanation" in slide && (
              <>
                <label><b>Explanation</b></label>
                <textarea
                  rows={3}
                  value={slide.explanation}
                  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].explanation = e.target.value;
                    setGeneratedCourse(updated);
                  }}
                  style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                />
              </>
            )}

            {"extra" in slide && (
              <>
                <label><b>Extra</b></label>
                <input
                  type="text"
                  value={slide.extra}
                  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].extra = e.target.value;
                    setGeneratedCourse(updated);
                  }}
                  style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                />
              </>
            )}

            {"challenge" in slide && (
              <>
                <label><b>Challenge</b></label>
                <textarea
                  rows={2}
                  value={slide.challenge}
                  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].challenge = e.target.value;
                    setGeneratedCourse(updated);
                  }}
                  style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
)}


    </div>
  );
};

export default CreateCourse;
