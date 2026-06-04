const CHART_DEFAULTS = {
    color: '#8b949e',
    plugins: {
        legend: { labels: { color: '#8b949e', boxWidth: 12, font: { size: 12 } } }
    },
    scales: {
        x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
        y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }
    },
    animation: { duration: 1200 },
    responsive: true,
    maintainAspectRatio: false
};

function mergeOptions(...sources) {
    return sources.reduce((acc, src) => {
        Object.keys(src).forEach(k => {
            if (typeof src[k] === 'object' && src[k] !== null && !Array.isArray(src[k])) {
                acc[k] = mergeOptions(acc[k] || {}, src[k]);
            } else {
                acc[k] = src[k];
            }
        });
        return acc;
    }, {});
}

fetch('/view_customer_data')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(customer => {
        document.getElementById('kundenNr').innerText = customer.clientnumber;
        document.getElementById('vorname').innerText = customer.firstname;
        document.getElementById('nachname').innerText = customer.lastname;
        document.getElementById('betriebsname').innerText = customer.company;
        document.getElementById('zeitraum').innerText = customer.invoices_date
            ? `${customer.invoices_date[0]} – ${customer.invoices_date[customer.invoices_date.length - 1]}`
            : 'N/A';

        const statusEl = document.getElementById('status');
        if (customer.fraud) {
            document.body.classList.add('is-fraud');
            statusEl.innerText = 'Anomalie Detected';
            statusEl.classList.add('anomaly');
        } else {
            statusEl.innerText = 'No Anomaly';
        }

        renderBenfordsChart(customer);
        renderTimelineChart(customer);
        renderQuarterlyChart(customer);
        renderYearlyChart(customer);
    })
    .catch(error => console.error('Error loading customer data:', error));

function renderBenfordsChart(customer) {
    const firstDigitPercentages = customer.first_digit_percentages || {};
    const observed = Array.from({ length: 9 }, (_, i) => firstDigitPercentages[i + 1] || 0);
    new Chart(document.getElementById('benfordsChart'), {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            datasets: [
                {
                    label: 'Invoice Distribution',
                    data: observed,
                    backgroundColor: 'rgba(88, 166, 255, 0.5)',
                    borderColor: 'rgba(88, 166, 255, 0.9)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: "Benford's Law",
                    data: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6],
                    type: 'line',
                    borderColor: '#f85149',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#f85149',
                    tension: 0.3,
                },
            ],
        },
        options: mergeOptions(CHART_DEFAULTS, {
            scales: {
                y: { ticks: { callback: v => v + '%' } }
            }
        }),
    });
}

function renderTimelineChart(customer) {
    new Chart(document.getElementById('yearlyChart'), {
        type: 'line',
        data: {
            labels: customer.invoices_date || [],
            datasets: [{
                label: 'Invoice Amount',
                data: customer.invoices || [],
                borderColor: '#3fb950',
                backgroundColor: 'rgba(63, 185, 80, 0.1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: true,
                tension: 0.3,
            }],
        },
        options: mergeOptions(CHART_DEFAULTS, {
            scales: {
                x: { ticks: { maxTicksLimit: 8, maxRotation: 0 } },
                y: { ticks: { callback: v => '$' + v.toLocaleString() } }
            }
        }),
    });
}

function renderQuarterlyChart(customer) {
    new Chart(document.getElementById('monthlyChart'), {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Revenue',
                data: aggregateQuarterlyData(customer.invoices_date, customer.invoices),
                backgroundColor: [
                    'rgba(188, 140, 255, 0.6)',
                    'rgba(188, 140, 255, 0.6)',
                    'rgba(188, 140, 255, 0.6)',
                    'rgba(188, 140, 255, 0.6)',
                ],
                borderColor: 'rgba(188, 140, 255, 0.9)',
                borderWidth: 1,
                borderRadius: 4,
            }],
        },
        options: mergeOptions(CHART_DEFAULTS, {
            scales: {
                y: { ticks: { callback: v => '$' + v.toLocaleString() } }
            }
        }),
    });
}

function renderYearlyChart(customer) {
    const yearlyData = aggregateYearlyData(customer.invoices_date, customer.invoices);
    new Chart(document.getElementById('incomeChart'), {
        type: 'bar',
        data: {
            labels: yearlyData.years,
            datasets: [{
                label: 'Total Invoiced',
                data: yearlyData.totals,
                backgroundColor: 'rgba(210, 153, 34, 0.5)',
                borderColor: 'rgba(210, 153, 34, 0.9)',
                borderWidth: 1,
                borderRadius: 4,
            }],
        },
        options: mergeOptions(CHART_DEFAULTS, {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => '$' + v.toLocaleString() }
                }
            }
        }),
    });
}

function aggregateQuarterlyData(dates, amounts) {
    const quarterlyData = [0, 0, 0, 0];
    if (!dates || !amounts) return quarterlyData;

    const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const mostRecentYear = dates.reduce((max, date) => {
        const match = date.match(/^[A-Za-z]{3} (\d{4})$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    dates.forEach((date, index) => {
        const match = date.match(/^([A-Za-z]{3}) (\d{4})$/);
        if (!match) return;
        const month = monthMap[match[1]];
        const year = parseInt(match[2], 10);
        if (year === mostRecentYear) {
            quarterlyData[Math.floor(month / 3)] += amounts[index];
        }
    });

    return quarterlyData;
}

function aggregateYearlyData(dates, amounts) {
    if (!dates || !amounts) return { years: [], totals: [] };

    const yearlyData = {};
    dates.forEach((date, index) => {
        const match = date.match(/^[A-Za-z]{3} (\d{4})$/);
        if (!match) return;
        const year = match[1];
        yearlyData[year] = (yearlyData[year] || 0) + amounts[index];
    });

    const years = Object.keys(yearlyData).sort();
    return { years, totals: years.map(y => yearlyData[y]) };
}
