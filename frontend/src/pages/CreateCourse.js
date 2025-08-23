import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("kids aged 8–14");
  const [weeks, setWeeks] = useState(1);
  const [slidesPerWeek, setSlidesPerWeek] = useState(6);
  const [objectives, setObjectives] = useState([""]);
  const [prompts, setPrompts] = useState([""]);
  const [resources, setResources] = useState([""]);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [quiz, setQuiz] = useState([
  { 
    question: "", 
    options: ["", "", "", ""], 
    correctAnswer: "" 
  }
]);

  const navigate = useNavigate();

  const addField = (setter, values) => {
    setter([...values, ""]);
  };

  const updateField = (setter, values, index, value) => {
    const updated = [...values];
    updated[index] = value;
    setter(updated);
  };

  const saveCourse = async () => {
    console.log(generatedCourse)
    generatedCourse['courseTitle']=courseTitle;
    generatedCourse['courseDescription']=courseDescription;
    const payload={
      user_id:localStorage.getItem("_id"),
      course_data:generatedCourse
    }
    try {
    const res = await fetch("http://localhost:8000/courses/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Course Saved Sucessfully')

    } else {
      console.error("❌ Error from backend:", data);
      alert("❌ Failed to generate course. Check console.");
    }
  } catch (error) {
    console.error("❌ Network or server error:", error);
    alert("❌ Error connecting to backend.");
  }

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
      setCourseTitle(data.title)
      setCourseDescription(data.description);
      delete data.title;
      delete data.description;
      setGeneratedCourse(data);
      const allQuizzes = Object.values(data).flatMap(week => week.quiz || []);
      setQuiz(allQuizzes);
      console.log(allQuizzes) 

    } else {
      console.error("❌ Error from backend:", data);
      alert("❌ Failed to generate course. Check console.");
    }
  } catch (error) {
    console.error("❌ Network or server error:", error);
    alert("❌ Error connecting to backend.");
  }
};


  const leftContainerStyle = {
  width: "40%",
  overflow: "auto",
  background: "black",
  borderRadius: "22px",
  margin:"5%",
  padding: "26px",
  border: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 8px 30px rgba(2,6,12,0.8), inset 0 1px 0 rgba(255,255,255,0.02)",
  color: "#e6eef8",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
};

const rightContainerStyle = {
  width: "60%",
  height:"800px",
  overflow: "auto",
  background: "black",
  borderRadius: "22px",
  margin:"5%",
  padding: "26px",
  border: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 8px 30px rgba(2,6,12,0.8), inset 0 1px 0 rgba(255,255,255,0.02)",
  color: "#e6eef8",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
};

const titleStyle = {
  margin: "0 0 18px 0",
  fontSize: "34px",
  fontWeight: 700,
  color: "#ffffff",
  lineHeight: 1,
  letterSpacing: "-0.5px",
};

const sectionStyle = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "#98a0aa",
  marginBottom: "8px",
};
const longInputStyle={
  marginBottom: "0.5rem" ,
  width: "90%",
  background: "rgba(6, 12, 16, 0.45)",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "15px",
  color: "#e6eef8",
  border: "1px solid blue",
  boxShadow: "inset 0 -6px 20px rgba(0,0,0,0.45)",
  outline: "none",
};
const inputStyle = {
  marginBottom: "0.5rem" ,
  width: "80%",
  background: "rgba(6, 12, 16, 0.45)",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "15px",
  color: "#e6eef8",
  border: "1px solid blue",
  boxShadow: "inset 0 -6px 20px rgba(0,0,0,0.45)",
  outline: "none",
};

const buttonStyle={
  background: "#000", 
  color: "#00aaff", 
  border: "2px solid #00aaff",
  borderRadius: "8px",
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease"
  
};






const addLinkStyle = {
  display: "inline-block",
  fontWeight: 600,
  color: "#39a6ff",
  marginTop: "8px",
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "14px",
  textAlign: "left",
};





  return (
    <div style={{display:'flex'}}>
      <div style={leftContainerStyle}>
        <h1 style={titleStyle}>Create Lesson</h1>

        {/* Topic */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Topic</label>
          <input type="text" placeholder="e.g. Intro to HTML" onChange={e => setTopic(e.target.value)} value={topic} style={longInputStyle}  />
        </div>

        {/* Audience */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Audience</label>
          <input
            type="text"
            value={audience}
            onChange={e => setAudience(e.target.value)}
            style={longInputStyle}
            placeholder="kids aged 8-14"
          />
        </div>

        {/* Number of Weeks & Slides per Week */}
        <div style={{ display: "flex", gap: "14px", ...sectionStyle }}>
          <div>
            <label style={labelStyle}>Number of Weeks</label>
            <input type="number" value={weeks} onChange={e => setWeeks(Number(e.target.value))}  style={inputStyle} placeholder="1" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Slides per Week</label>
            <input type="number" value={slidesPerWeek} min={1} onChange={e => setSlidesPerWeek(Number(e.target.value))} style={inputStyle} defaultValue="6" />
          </div>
        </div>

        {/* Weekly Objectives */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Weekly Objectives</label>
          {objectives.map((obj, i) => (
            <input
              class="w-100"
              key={i}
              style={longInputStyle}
              value={obj}
              onChange={e => updateField(setObjectives, objectives, i, e.target.value)}
              placeholder={`Objective ${i + 1}`}
            />
          ))}
          <button
            type="button"
            style={addLinkStyle}
            onClick={() => addField(setObjectives, objectives)}
          >
            + Add Objective
          </button>
        </div>


        {/* Additional Resources */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Additional Resources</label>
          {resources.map((obj, i) => (
            <input
              class="w-100"
              key={i}
              style={longInputStyle}
              value={obj}
              onChange={e => updateField(setResources, resources, i, e.target.value)}
              placeholder={`Resource ${i + 1}`}
            />

          ))}
          <div>

          
            
            <button type="button" style={addLinkStyle} onClick={() => addField(setResources, resources)}>
              + Add Resource
            </button>
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>Prompts to consider</label>
          {prompts.map((obj, i) => (
            <input
              class="w-100"
              key={i}
              style={longInputStyle}
              value={obj}
              onChange={e => updateField(setPrompts, prompts, i, e.target.value)}
              placeholder={`Prompts ${i + 1}`}
            />

          ))}
          <div>

          
            
            <button type="button" style={addLinkStyle} onClick={() => addField(setPrompts, prompts)}>
              + Add Prompts
            </button>
          </div>
        </div>
        <button style={buttonStyle} onClick={handleGenerate}>Generate</button>
      </div>
      {generatedCourse && (
        <div style={rightContainerStyle}>
          {Object.entries(generatedCourse).map(([weekKey, weekData], weekIndex) => (
            <div key={weekKey} style={{ marginBottom: "2rem" }}>
              <h1 style={titleStyle}>{weekKey.toUpperCase()}</h1>
              <input type="text" value={weekData.objectives} style={longInputStyle}  />

              {weekData.slides.map((slide, slideIndex) => (
                <div style={{marginTop:'10px'}}>
                  <h1 style={titleStyle}>Slide {slideIndex+1}</h1>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Title</label>
                    <input type="text" placeholder="e.g. Intro to HTML" onChange={(e) => {
                      const updated = { ...generatedCourse };
                      updated[weekKey].slides[slideIndex].title = e.target.value;
                      setGeneratedCourse(updated);
                    }} value={slide.title} style={longInputStyle}  />

                  </div>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Explanation</label>
                    <textarea type="text"  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].explanation = e.target.value;
                    setGeneratedCourse(updated);
                  }} value={slide.explanation}style={longInputStyle}  />
                  </div>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Extra</label>
                    <input type="text"  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].extra = e.target.value;
                    setGeneratedCourse(updated);
                  }} value={slide.extra}style={longInputStyle}  />
                  </div>
                  <div style={sectionStyle}>
                    <label style={labelStyle}>Challenge</label>
                    <textarea type="text"  onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].slides[slideIndex].challenge = e.target.value;
                    setGeneratedCourse(updated);
                  }} value={slide.challenge}style={longInputStyle}  />
                  </div>
                </div>
              ))
                
              }
              <h1>Quiz</h1>
              {weekData.quiz.map((quiz, quizIndex) => (
                <div>
                
                <label style={labelStyle}>Question{quizIndex+1}</label>
                <input type="text"  value={quiz.question}style={longInputStyle}  onChange={(e) => {
                  const updated = { ...generatedCourse };
                  updated[weekKey].quiz[quizIndex].question = e.target.value;
                  setGeneratedCourse(updated);
                }}/>
                {quiz.options.map((option, optionIndex) => (
                  <div>
                  <label style={labelStyle}>Option{optionIndex+1}</label>
                  <input type="text"  value={option}style={longInputStyle} onChange={(e) => {
                    const updated = { ...generatedCourse };
                    updated[weekKey].quiz[quizIndex].options[optionIndex] = e.target.value;
                    setGeneratedCourse(updated);
                  }} />
                  </div>
                ))}
                </div>
              ))}

              
            </div>
          ))}
          <button style={buttonStyle} onClick={saveCourse}>Save Course</button>
        </div>

      )};
    </div>
  );
};

export default CreateCourse;
