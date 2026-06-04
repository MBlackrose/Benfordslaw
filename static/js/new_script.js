window.customerData = [];

fetch('/static/customers_data.json')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(customers => fetch('/fraud_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customers),
    }))
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        window.customerData = data;

        const fraudCount = data.filter(c => c.fraud).length;
        document.getElementById('statTotal').innerText = data.length;
        document.getElementById('statOk').innerText = data.length - fraudCount;
        document.getElementById('statFraud').innerText = fraudCount;
        document.getElementById('tableHint').innerText =
            fraudCount > 0 ? `${fraudCount} anomaly detected` : 'All records clean';

        const tableBody = document.getElementById('customerTableBody');
        tableBody.innerHTML = '';

        data.forEach((customer, index) => {
            const row = document.createElement('tr');
            if (customer.fraud) row.classList.add('row-fraud');

            row.innerHTML = `
                <td class="cell-id">${customer.clientnumber}</td>
                <td class="cell-name">${customer.firstname}</td>
                <td>${customer.lastname}</td>
                <td class="cell-company">${customer.company}</td>
                <td>
                    ${customer.fraud
                        ? `<span class="status-badge status-badge--fraud" onclick="openAnomalyManager(${index})">
                               <span class="badge-dot"></span>Anomaly
                           </span>`
                        : `<span class="status-badge status-badge--ok">
                               <span class="badge-dot"></span>Clean
                           </span>`
                    }
                </td>
            `;

            if (customer.fraud) {
                row.addEventListener('click', (e) => {
                    if (!e.target.closest('.status-badge')) openAnomalyManager(index);
                });
            }

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('tableHint').innerText = 'Failed to load data';
    });

function openAnomalyManager(index) {
    const customer = window.customerData[index];
    fetch('/view_customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    })
    .then(() => window.open('/anomaly_manager', '_blank'))
    .catch(error => console.error('Error:', error));
}
