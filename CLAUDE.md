# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Docker is the only supported way to run this project:

```sh
docker compose build
docker compose up
```

App is available at [http://127.0.0.1:5000](http://127.0.0.1:5000).

For local development without Docker (requires `pip install flask benfordslaw numpy`):

```sh
python main.py
```

## Architecture

This is a Flask web app that detects financial fraud using [Benford's Law](https://en.wikipedia.org/wiki/Benford%27s_law) — the statistical principle that in many naturally occurring datasets, the leading digit is more likely to be small. Artificially fabricated numbers often violate this distribution.

**Data flow:**
1. The browser fetches `static/customers_data.json` directly and POSTs all customer records to `/fraud_check`
2. Flask runs a chi-squared Benford's Law test (`benfordslaw` lib, α=0.05) on each customer's invoice list and returns fraud flags + first-digit percentages
3. The customer table (`new_freeburg.html` + `new_script.js`) renders a status button per customer — "Okay" or "Anomaly"
4. Clicking a flagged customer POSTs their data to `/view_customer` (stored server-side in `selected_customer`), then opens `/anomaly_manager` in a new tab
5. The Anomaly Manager (`anomaly_manager.html` + `anomaly_script.js`) fetches `/view_customer_data` and renders four Chart.js charts: Benford's distribution overlay, invoice timeline, quarterly revenue, and yearly income

**Key constraint:** `selected_customer` is a module-level global dict — no database, no sessions. Only one customer can be "selected" at a time per server process.

## Customer Data Format

`static/customers_data.json` is the input data file. Each record must have:
- `clientnumber`, `firstname`, `lastname`, `company`
- `invoices`: list of numeric invoice amounts (used for Benford analysis)
- `invoices_date`: list of date strings in `"MMM YYYY"` format (e.g. `"Jan 2024"`) — must parallel `invoices`
