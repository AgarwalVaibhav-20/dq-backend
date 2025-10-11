# PowerShell script to start the server with environment variables
Write-Host "Setting up environment variables..." -ForegroundColor Green
$env:MONGO_URL = "mongodb+srv://nileshgoyal624_db_user:nilesh774@cluster0.t0sg444.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/dqdashboard"
$env:PORT = "4000"

Write-Host "Starting server..." -ForegroundColor Green
npm start
