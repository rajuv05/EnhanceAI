FROM python:3.13-slim

WORKDIR /app

# Install FFmpeg and clean up
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure uploads directories exist
RUN mkdir -p uploads/original uploads/enhanced

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
