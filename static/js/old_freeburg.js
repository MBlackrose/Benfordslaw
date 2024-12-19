// Load customer data from the JSON file
fetch('customers_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
    })
    .then(customers => {
        // Populate the table with customer data
        const tableBody = document.getElementById('customerTableBody');
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.clientnumber}</td>
                <td>${customer.firstname}</td>
                <td>${customer.lastname}</td>
                <td>${customer.company}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading customer data:', error);
    });