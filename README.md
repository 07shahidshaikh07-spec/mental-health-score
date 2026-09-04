# MindCheck Frontend

Frontend for the Student Mental Health ML FastAPI project.

## 1. Run the FastAPI backend

Save your API code as `main.py`, keep `Mental_Health_Model.pkl` in the same directory, then run:

```bash
pip install fastapi uvicorn pandas joblib pydantic scikit-learn
uvicorn main:app --reload
```

The API should be available at:

http://127.0.0.1:8000

Swagger docs:

http://127.0.0.1:8000/docs

## 2. Run the frontend

Open `index.html` in a browser.

If the browser blocks requests from a local file, run a simple static server from this folder:

```bash
python -m http.server 5500
```

Then open:

http://127.0.0.1:5500

## 3. API contract

The frontend sends exactly these fields to `POST /predict`:

- age
- gender
- country
- academic_level
- most_used_platform
- purpose_of_use
- avg_daily_usage_hours
- daily_unlocks
- study_hours
- physical_activity_hours
- sleep_hours_per_night
- stress_level

Expected response:

```json
{
  "predicted_mental_health_score": 6.78
}
```

## Important model note

The UI currently displays the score on a 0–10 visual scale. If your model was trained with a different target range, update `MAX_SCORE` in `script.js` and adjust the interpretation thresholds.

The result should be presented as a screening estimate, not a clinical diagnosis.
