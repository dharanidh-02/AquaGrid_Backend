from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from datetime import datetime, timedelta

app = Flask(__name__)

# Dummy Data Generation for Training
def generate_dummy_data():
    dates = pd.date_range(start="2023-01-01", periods=100)
    data = pd.DataFrame({
        'date': dates,
        'usage': np.random.normal(1000, 100, 100) # Mean 1000, SD 100
    })
    # Add some seasonality/trend
    data['usage'] += np.sin(np.linspace(0, 10, 100)) * 50
    return data

# Train Models
print("Training models...")
df = generate_dummy_data()
X = np.array(range(len(df))).reshape(-1, 1)
y = df['usage'].values

# Forecasting Model
forecaster = RandomForestRegressor(n_estimators=100)
forecaster.fit(X, y)

# Anomaly Detection Model
isolation_forest = IsolationForest(contamination=0.05)
isolation_forest.fit(y.reshape(-1, 1))
print("Models trained.")

@app.route('/api/predict-demand', methods=['POST'])
def predict_demand():
    try:
        # Predict for next 7 days
        last_index = len(df)
        future_indices = np.array(range(last_index, last_index + 7)).reshape(-1, 1)
        predictions = forecaster.predict(future_indices)
        
        response = {
            'predictions': predictions.tolist(),
            'confidence_score': 0.85, # Mock confidence
            'risk_level': 'Low' if np.mean(predictions) < 1200 else 'High'
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-anomaly', methods=['POST'])
def detect_anomaly():
    try:
        data = request.json
        value = data.get('value')
        
        if value is None:
            return jsonify({'error': 'No value provided'}), 400

        # Predict anomaly (-1 is anomaly, 1 is normal)
        prediction = isolation_forest.predict([[value]])[0]
        score = isolation_forest.decision_function([[value]])[0]
        
        is_anomaly = True if prediction == -1 else False
        
        response = {
            'is_anomaly': is_anomaly,
            'anomaly_probability': float(1 - (score + 0.5)), # Rough probability mapping
            'leak_risk_score': 80 if is_anomaly else 10
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
