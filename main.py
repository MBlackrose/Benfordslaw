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
    print(results)
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
        if invoices:
            # Run the Benford's Law analysis again to get full results
            bl = benfordslaw(alpha=0.05, method='chi2')
            results = bl.fit(np.array(invoices))
            
            # Check for fraud using the existing function
            customer['fraud'] = check_fraud(invoices)
            
            # Extract and store first-digit percentages
            percentage_emp = results['percentage_emp']
            customer['first_digit_percentages'] = {int(row[0]): row[1] for row in percentage_emp}
        else:
            customer['fraud'] = False
            customer['first_digit_percentages'] = {}

    # Ensure all returned data is JSON serializable
    serializable_customers = []
    for customer in customers:
        serializable_customer = {
            "clientnumber": customer.get("clientnumber"),
            "firstname": customer.get("firstname"),
            "lastname": customer.get("lastname"),
            "company": customer.get("company"),
            "fraud": bool(customer.get("fraud", False)),
            "invoices": customer.get("invoices", []),
            "invoices_date": customer.get("invoices_date", []),
            "first_digit_percentages": customer.get("first_digit_percentages", {})
        }
        serializable_customers.append(serializable_customer)

    return jsonify(serializable_customers)


# Temporary storage for selected customer data
selected_customer = {}

@app.route('/view_customer', methods=['POST'])
def view_customer():
    global selected_customer
    selected_customer = request.get_json()
    print("Selected Customer:", selected_customer)  # Debugging
    return '', 204  # No Content response

@app.route('/view_customer_data', methods=['GET'])
def view_customer_data():
    if not selected_customer:
        return jsonify({"error": "No customer data available"}), 404
    return jsonify(selected_customer)

@app.route('/anomaly_manager')
def anomaly_manager():
    if not selected_customer:
        return redirect(url_for('customer_info'))  # Redirect to the main page if no customer is selected
    return render_template('anomaly_manager.html')  # Serve the anomaly manager page


@app.route('/anomaly_manager_data', methods=['GET'])
def anomaly_manager_data():
    if not selected_customer:
        return jsonify({"error": "No customer selected"}), 404
    return jsonify(selected_customer)

if __name__ == '__main__':
    app.run(debug=True)
