from flask import Flask, request, jsonify, render_template
from benfordslaw import benfordslaw
import numpy as np

app = Flask(__name__)

# Fraud detection function
def check_fraud(invoices):
    bl = benfordslaw(alpha=0.05, method='chi2')
    results = bl.fit(np.array(invoices))
    return results['P'] < bl.alpha

# Serve the main HTML page
@app.route('/')
def customer_info():
    return render_template('new_freeburg.html')  # No need for a leading slash

# Fraud check endpoint
@app.route('/fraud_check', methods=['POST'])
def fraud_check():
    customers = request.get_json()  # Expecting JSON data from frontend
    print(customers)  # Debugging helper to inspect incoming data

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
            "fraud": bool(customer.get("fraud", False)),  # Ensure 'fraud' is a boolean
        }
        serializable_customers.append(serializable_customer)

    return jsonify(serializable_customers)

if __name__ == '__main__':
    app.run(debug=True)
