from flask import Flask, request, jsonify, render_template, redirect, url_for
from benfordslaw import benfordslaw
import numpy as np

app = Flask(__name__)

# Temporary storage for selected customer data
selected_customer = {}

# Fraud detection function
def check_fraud(invoices):
    bl = benfordslaw(alpha=0.05, method='chi2')
    results = bl.fit(np.array(invoices))
    return results['P'] < bl.alpha

@app.route('/')
def customer_info():
    return render_template('new_freeburg.html')

@app.route('/fraud_check', methods=['POST'])
def fraud_check():
    customers = request.get_json()  # Expecting JSON data from the frontend

    # Perform fraud analysis on each customer
    for customer in customers:
        invoices = customer.get('invoices', [])
        customer['fraud'] = check_fraud(invoices) if invoices else False

    # Ensure all returned data is JSON serializable
    serializable_customers = []
    for customer in customers:
        serializable_customer = {
            "clientnumber": customer.get("clientnumber"),
            "firstname": customer.get("firstname"),
            "lastname": customer.get("lastname"),
            "company": customer.get("company"),
            "fraud": bool(customer.get("fraud", False)),  # Explicitly ensure 'fraud' is a boolean
        }
        serializable_customers.append(serializable_customer)

    return jsonify(serializable_customers)


@app.route('/view_customer', methods=['POST'])
def view_customer():
    global selected_customer
    selected_customer = request.get_json()
    print("Selected Customer:", selected_customer)  # Debugging
    return '', 204

@app.route('/anomaly_manager')
def anomaly_manager():
    if not selected_customer:
        return redirect(url_for('customer_info'))  # Redirect if no customer is selected
    return render_template('anomaly_manager.html')

@app.route('/anomaly_manager_data', methods=['GET'])
def anomaly_manager_data():
    if not selected_customer:
        return jsonify({"error": "No customer selected"}), 404
    return jsonify(selected_customer)

if __name__ == '__main__':
    app.run(debug=True)
