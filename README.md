# Fraud Finder with Benford's Law

> A simple yet powerful project for detecting fraud using Benford's Law.

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)

## Usage

### Clone the Repository
```sh
git clone https://github.com/MBlackrose/Benfordslaw
```


### Build and Start Docker Compose

```sh
cd Benfordslaw
docker compose build
docker compose up
```

### Output Example

After a few seconds, you should see output like this:

```plaintext
[+] Running 1/1
 ✔ Container benfordslaw-benfordslaw-app-1  Recreated                                                                                                        0.2s 
Attaching to benfordslaw-app-1
benfordslaw-app-1  |  * Serving Flask app 'main'
benfordslaw-app-1  |  * Debug mode: on
benfordslaw-app-1  | WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
benfordslaw-app-1  |  * Running on all addresses (0.0.0.0)
benfordslaw-app-1  |  * Running on http://127.0.0.1:5000
benfordslaw-app-1  |  * Running on http://172.18.0.2:5000
benfordslaw-app-1  | Press CTRL+C to quit
benfordslaw-app-1  |  * Restarting with stat
benfordslaw-app-1  |  * Debugger is active!
benfordslaw-app-1  |  * Debugger PIN: 450-491-990
benfordslaw-app-1  | 172.18.0.1 - - [18/Dec/2024 14:24:00] "GET / HTTP/1.1" 200 -
benfordslaw-app-1  | 172.18.0.1 - - [18/Dec/2024 14:24:00] "GET /static/customers_data.json HTTP/1.1" 200 -
benfordslaw-app-1  | 172.18.0.1 - - [18/Dec/2024 14:24:00] "GET /favicon.ico HTTP/1.1" 404 -
benfordslaw-app-1  | 172.18.0.1 - - [18/Dec/2024 14:24:00] "POST /fraud_check HTTP/1.1" 200 -

```

### Access the Test Page

The server is running in the background, and a test page is ready for you at: [http://127.0.0.1:5000](http://127.0.0.1:5000/)

