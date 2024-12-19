// Load customer data from the JSON file
fetch('/static/customers_data.json')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(customers => {
        // Send customer data to the backend for fraud detection
        return fetch('/fraud_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customers), // Send the entire JSON
        });
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('customerTableBody');
        data.forEach((customer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.clientnumber}</td>
                <td>${customer.firstname}</td>
                <td>${customer.lastname}</td>
                <td>${customer.company}</td>
                <td>
                    <button class="btn ${customer.fraud ? 'btn-danger' : 'btn-success'}"
                            onclick="handleButtonClick(${index})">
                        ${customer.fraud ? 'Anomaly' : 'Okay'}
                    </button>
                </td>
            `;
            tableBody.appendChild(row);

            // Attach data to a global array for safe access
            window.customerData = window.customerData || [];
            window.customerData[index] = customer;
        });
    })
    .catch(error => console.error('Error:', error));

// Handle button clicks
function handleButtonClick(index) {
    const customer = window.customerData[index]; // Retrieve customer data by index
    fetch('/view_customer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    }).then(() => {
        window.open('/anomaly_manager', '_blank'); // Open in a new tab
    }).catch(error => console.error('Error sending customer data:', error));
}