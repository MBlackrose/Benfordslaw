# Use the official Python image as a base
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy necessary files to the container
COPY main.py /app/main.py
COPY requirements.txt /app/requirements.txt
COPY static /app/static
COPY templates /app/templates

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask app port
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "main.py"]
