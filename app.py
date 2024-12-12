from flask import Flask, render_template, request, redirect, url_for
from benfordslaw import benfordslaw
import numpy as np

app = Flask(__name__)

# Dummy user data
users = [
    {
        "id": 1,
        "first_name": "Alice",
        "last_name": "Smith",
        "company": "Tech Corp",
        "address": "123 Tech Lane",
        "invoices": [656.26, 502.29, 359.08, 438.95, 183.36, 575.63, 529.35, 307.99, 292.26, 615.49, 686.28, 235.93, 247.99, 380.96, 865.74, 450.8, 222.9, 787.69, 967.42, 575.67],
        "anomaly": False,
    },
    {
        "id": 2,
        "first_name": "Bob",
        "last_name": "Johnson",
        "company": "Biz Solutions",
        "address": "456 Business St",
        "invoices": [82.45, 46.91, 87.32, 74.56, 13.67, 25.89, 37.21, 51.74, 61.43, 31.57, 19.85, 93.42, 71.28, 20.64, 57.39, 56.78, 36.12, 30.87, 49.53, 25.14,73.68, 35.91, 86.24, 91.75, 56.43, 16.89, 12.34, 82.56, 35.18, 18.72,98.31, 67.48, 93.69, 31.84, 29.16, 69.47, 60.92, 64.38, 74.29, 77.15,86.71, 14.82, 41.63, 20.45, 20.89, 13.57, 93.41, 52.78, 75.19, 14.36,299.74, 918.62, 296.47, 802.19, 506.92, 466.34, 884.75, 673.41, 103.58, 574.82,209.37, 267.49, 574.63, 836.72, 467.91, 154.38, 586.29, 626.74, 548.31, 288.56,187.62, 649.43, 394.17, 475.39, 948.25, 700.86, 937.47, 215.68, 439.57, 288.93,200.45, 977.83, 901.62, 554.21, 976.34, 107.48, 698.92, 928.74, 289.63, 375.18,938.27, 620.89, 880.35, 554.72, 575.46, 813.91, 338.12, 369.84, 213.74, 772.56],
        "anomaly": False,
    },
]

# Fraud check function
def check_fraud(invoices):
    bl = benfordslaw(alpha=0.05, method='chi2')
    results = bl.fit(np.array(invoices))
    return results['P'] < bl.alpha  # Returns True if there's an anomaly

@app.route('/')
def index():
    return render_template('index.html', users=users)

@app.route('/check/<int:user_id>')
def check(user_id):
    # Find the user
    user = next((u for u in users if u['id'] == user_id), None)
    if user:
        # Check for fraud
        anomaly = check_fraud(user['invoices'])
        user['status'] = "Anomaly" if anomaly else "Normal"
    return redirect(url_for('index'))

@app.route('/user/<int:user_id>')
def user_details(user_id):
    # Find the user
    user = next((u for u in users if u['id'] == user_id), None)
    if not user:
        return "User not found", 404
    return render_template('user_details.html', user=user)

if __name__ == '__main__':
    app.run(debug=True)