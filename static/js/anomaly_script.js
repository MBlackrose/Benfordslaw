// Fetch selected customer data from the backend
fetch('/view_customer_data')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(customer => {
        // Populate customer information
        document.getElementById('kundenNr').innerText = customer.clientnumber;
        document.getElementById('vorname').innerText = customer.firstname;
        document.getElementById('nachname').innerText = customer.lastname;
        document.getElementById('betriebsname').innerText = customer.company;
        document.getElementById('zeitraum').innerText = customer.invoices_date ? `${customer.invoices_date[0]} - ${customer.invoices_date[customer.invoices_date.length - 1]}` : 'N/A';

        const statusElement = document.getElementById('status');
        if (customer.fraud) {
            document.body.style.backgroundColor = 'rgba(200, 50, 50, 0.3)';
            statusElement.innerText = 'Anomalie';
            statusElement.style.color = 'darkred';
        } else {
            document.body.style.backgroundColor = 'white';
            statusElement.innerText = 'Keine Anomalie';
            statusElement.style.color = 'black';
        }

        // Render Benford's Law Chart
        const firstDigitPercentages = customer.first_digit_percentages || {};
        const observedPercentages = Array.from({ length: 9 }, (_, i) => firstDigitPercentages[i + 1] || 0);
        const benfordsCtx = document.getElementById('benfordsChart').getContext('2d');
        new Chart(benfordsCtx, {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                datasets: [
                    {
                        label: 'Invoice Distribution',
                        data: observedPercentages, // Observed percentages
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                        label: "Benford's Law",
                        data: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6],
                        type: 'line',
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        ticks: {
                            callback: function (value) {
                                return value + '%'; // Add percentage sign
                            },
                        },
                    },
                },
                responsive: true,
                animation: {
                    duration: 2000,
                },
            },
        });

        // Render Yearly Chart
        const yearlyCtx = document.getElementById('yearlyChart').getContext('2d');
        new Chart(yearlyCtx, {
            type: 'line',
            data: {
                labels: customer.invoices_date || [],
                datasets: [
                    {
                        label: 'Invoices Over Time',
                        data: customer.invoices || [],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)', // Color
                    },
                ],
            },
            options: {
                responsive: true,
                animation: {
                    duration: 2000, // Animation duration in milliseconds
                },
            },
        });

        // Render Quarterly Chart
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                    {
                        label: 'Quarterly Revenue',
                        data: aggregateQuarterlyData(customer.invoices_date, customer.invoices),
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    },
                ],
            },
            options: {
                responsive: true,
                animation: {
                    duration: 2000, // Animation duration in milliseconds
                },
            },
        });

        // Render Yearly Income Chart
        const incomeCtx = document.getElementById('incomeChart').getContext('2d');
        const yearlyData = aggregateYearlyData(customer.invoices_date, customer.invoices);

        new Chart(incomeCtx, {
            type: 'bar',
            data: {
                labels: yearlyData.years, // Use years as labels
                datasets: [
                    {
                        label: 'Invoices Yearly',
                        data: yearlyData.totals, // Use totals as data
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    },
                ],
            },
            options: {
                responsive: true,
                animation: {
                    duration: 2000, // Animation duration in milliseconds
                },
                scales: {
                    y: {
                        beginAtZero: true, // Ensure the Y-axis starts at zero
                        ticks: {
                            callback: function (value) {
                                return `$${value.toFixed(2)}`; // Format values as currency
                            },
                        },
                    },
                },
            },
        });
    })
    .catch(error => console.error('Error loading customer data:', error));

// Helper function to aggregate quarterly data
function aggregateQuarterlyData(dates, amounts) {
    const quarterlyData = [0, 0, 0, 0]; // Q1, Q2, Q3, Q4
    if (!dates || !amounts) {
        console.error("Dates or amounts are missing:", { dates, amounts });
        return quarterlyData;
    }

    const currentYear = new Date().getFullYear(); // Get the current year
    console.log("Current Year:", currentYear);

    dates.forEach((date, index) => {
        // Match the "MMM YYYY" format using a regular expression
        const match = date.match(/^([A-Za-z]{3}) (\d{4})$/);
        if (!match) {
            console.error("Invalid date format:", date);
            return;
        }

        // Extract month and year
        const [_, monthStr, yearStr] = match;
        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const month = monthMap[monthStr];
        const year = parseInt(yearStr, 10);

        // Process only current-year invoices
        if (year === currentYear) {
            const quarter = Math.floor(month / 3); // Map month to quarter (0 = Q1, 1 = Q2, etc.)
            console.log(`Adding ${amounts[index]} to Q${quarter + 1} (Month: ${monthStr})`);
            quarterlyData[quarter] += amounts[index];
        } else {
            console.log(`Skipping invoice: ${date} (${year})`);
        }
    });

    console.log("Quarterly Data:", quarterlyData);
    return quarterlyData;
}

// Helper function to extract unique years
function extractYears(dates) {
    if (!dates) return [];
    const years = dates.map(date => new Date(date).getFullYear());
    return [...new Set(years)];
}

// Helper function to aggregate yearly data
function aggregateYearlyData(dates, amounts) {
    if (!dates || !amounts) {
        console.error("Missing dates or amounts:", { dates, amounts });
        return [];
    }

    const yearlyData = {}; // Object to hold totals for each year

    dates.forEach((date, index) => {
        // Match the "MMM YYYY" format using a regular expression
        const match = date.match(/^([A-Za-z]{3}) (\d{4})$/);
        if (!match) {
            console.error("Invalid date format:", date);
            return;
        }

        // Extract year
        const year = parseInt(match[2], 10);

        // Add the amount to the corresponding year
        yearlyData[year] = (yearlyData[year] || 0) + amounts[index];
    });

    // Convert the object to an array for chart consumption
    const years = Object.keys(yearlyData).sort(); // Sort years in ascending order
    const totals = years.map(year => yearlyData[year]);

    console.log("Yearly Totals:", { years, totals });
    return { years, totals }; // Return both years and totals
}