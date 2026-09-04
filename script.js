const API_URL = "http://localhost:8000";

const form = document.getElementById("predictionForm");
const result = document.getElementById("result");
const errorBox = document.getElementById("errorBox");
const predictBtn = document.getElementById("predictBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

async function checkAPI() {
  try {
    const res = await fetch(`${API_URL}/`, { method: "GET" });
    if (!res.ok) throw new Error();
    statusDot.style.background = "#20a16b";
    statusText.textContent = "API connected";
  } catch {
    statusDot.style.background = "#e09a28";
    statusText.textContent = "API offline";
  }
}

function getValue(id) {
  const el = document.getElementById(id);
  return el.value;
}

function buildPayload() {
  return {
    age: Number(getValue("age")),
    gender: getValue("gender"),
    country: getValue("country").trim(),
    academic_level: getValue("academic_level"),
    most_used_platform: getValue("most_used_platform"),
    purpose_of_use: getValue("purpose_of_use"),
    avg_daily_usage_hours: Number(getValue("avg_daily_usage_hours")),
    daily_unlocks: Number(getValue("daily_unlocks")),
    study_hours: Number(getValue("study_hours")),
    physical_activity_hours: Number(getValue("physical_activity_hours")),
    sleep_hours_per_night: Number(getValue("sleep_hours_per_night")),
    stress_level: getValue("stress_level")
  };
}

function setLoading(loading) {
  predictBtn.disabled = loading;
  btnText.textContent = loading ? "Calculating..." : "Calculate score";
  spinner.classList.toggle("hidden", !loading);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function showResult(score) {
  const safeScore = Number(score);
  document.getElementById("score").textContent = safeScore.toFixed(2);

  // Visual scale assumes the returned score is on a 0–10 scale.
  // Change MAX_SCORE below if your training target uses another scale.
  const MAX_SCORE = 10;
  const pct = Math.max(0, Math.min(100, (safeScore / MAX_SCORE) * 100));
  document.querySelector(".score-ring").style.setProperty("--score", `${pct}%`);

  let title, badge, text;
  if (safeScore < 4) {
    badge = "Lower range";
    title = "The estimated score is in the lower range";
    text = "This model output suggests a comparatively lower score based on the information provided.";
  } else if (safeScore < 7) {
    badge = "Moderate range";
    title = "The estimated score is in the moderate range";
    text = "Some of the reported factors may be associated with a moderate level of concern according to the model.";
  } else {
    badge = "Higher range";
    title = "The estimated score is in the higher range";
    text = "The model produced a higher estimated score. Consider this a screening signal rather than a diagnosis.";
  }

  document.getElementById("riskBadge").textContent = badge;
  document.getElementById("riskTitle").textContent = title;
  document.getElementById("riskText").textContent = text;

  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();
  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload())
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`API returned HTTP ${response.status} without valid JSON.`);
    }

    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map(x => `${x.loc?.join(".")}: ${x.msg}`).join(" | ")
        : (data.detail || "Prediction request failed.");
      throw new Error(detail);
    }

    if (typeof data.predicted_mental_health_score !== "number") {
      throw new Error("The API response does not contain a numeric predicted_mental_health_score.");
    }

    showResult(data.predicted_mental_health_score);
    statusDot.style.background = "#20a16b";
    statusText.textContent = "API connected";
  } catch (error) {
    showError(
      `Could not get a prediction. Make sure FastAPI is running at ${API_URL}. ` +
      `Details: ${error.message}`
    );
  } finally {
    setLoading(false);
  }
});

document.getElementById("closeResult").addEventListener("click", () => {
  result.classList.add("hidden");
});

checkAPI();
