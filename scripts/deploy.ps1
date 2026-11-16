# Stayora Production Deployment Script for Windows
# This script handles the complete deployment process for the Stayora application

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "rollback", "backup", "health", "logs", "cleanup", "help")]
    [string]$Action = "deploy"
)

# Configuration
$ProjectName = "stayora"
$BackupDir = "./backups"
$LogFile = "./logs/deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "logs", "backups" | Out-Null

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage -ForegroundColor Cyan }
    }
    
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Error-Exit {
    param([string]$Message)
    Write-Log $Message "ERROR"
    exit 1
}

# Check requirements
function Test-Requirements {
    Write-Log "Checking deployment requirements..."
    
    if (-not (Test-Path ".env.production")) {
        Write-Error-Exit ".env.production file not found. Please create it with production environment variables."
    }
    
    if (-not (Test-Path "docker-compose.prod.yml")) {
        Write-Error-Exit "docker-compose.prod.yml not found."
    }
    
    # Check if Docker is installed and running
    try {
        docker --version | Out-Null
        docker info | Out-Null
    }
    catch {
        Write-Error-Exit "Docker is not installed or not running."
    }
    
    # Check if Docker Compose is available
    try {
        docker-compose --version | Out-Null
    }
    catch {
        try {
            docker compose version | Out-Null
        }
        catch {
            Write-Error-Exit "Docker Compose is not installed."
        }
    }
    
    Write-Log "✓ All requirements satisfied" "SUCCESS"
}

# Backup existing data
function Backup-Data {
    Write-Log "Creating backup of existing data..."
    
    $backupTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $BackupDir "backup-$backupTimestamp"
    
    New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
    
    # Backup database if container exists
    $postgresContainer = "$ProjectName-postgres-prod"
    if (docker ps -a --format "table {{.Names}}" | Select-String $postgresContainer) {
        Write-Log "Backing up PostgreSQL database..." "INFO"
        try {
            docker exec $postgresContainer pg_dump -U stayora_user stayora_prod | Out-File -FilePath "$backupPath/database.sql" -Encoding UTF8
        }
        catch {
            Write-Log "Database backup failed" "WARNING"
        }
    }
    
    # Backup uploaded files if they exist
    if (Test-Path "./uploads") {
        Write-Log "Backing up uploaded files..." "INFO"
        try {
            Copy-Item -Path "./uploads" -Destination $backupPath -Recurse
        }
        catch {
            Write-Log "File backup failed" "WARNING"
        }
    }
    
    Write-Log "✓ Backup created at $backupPath" "SUCCESS"
}

# Deploy application
function Deploy-Application {
    Write-Log "Starting deployment process..."
    
    # Build Docker images
    Write-Log "Building Docker images..." "INFO"
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Stop existing containers
    Write-Log "Stopping existing containers..." "INFO"
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    Write-Log "Starting new containers..." "INFO"
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    Write-Log "Waiting for services to be ready..." "INFO"
    Start-Sleep -Seconds 30
    
    # Run database migrations
    Write-Log "Running database migrations..." "INFO"
    try {
        docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate
    }
    catch {
        Write-Log "Migration failed" "WARNING"
    }
    
    Write-Log "✓ Deployment completed successfully" "SUCCESS"
}

# Health check
function Test-Health {
    Write-Log "Performing health checks..."
    
    # Check if containers are running
    $containers = @(
        "$ProjectName-postgres-prod",
        "$ProjectName-redis-prod", 
        "$ProjectName-backend-prod",
        "$ProjectName-frontend-prod",
        "$ProjectName-nginx-prod"
    )
    
    foreach ($container in $containers) {
        if (docker ps --format "table {{.Names}}" | Select-String $container) {
            Write-Log "✓ $container is running" "SUCCESS"
        }
        else {
            Write-Log "✗ $container is not running" "WARNING"
        }
    }
    
    # Check application endpoints
    Write-Log "Checking application endpoints..." "INFO"
    
    # Backend health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "✓ Backend API is responding" "SUCCESS"
        }
    }
    catch {
        Write-Log "✗ Backend API is not responding" "WARNING"
    }
    
    # Frontend health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "✓ Frontend is responding" "SUCCESS"
        }
    }
    catch {
        Write-Log "✗ Frontend is not responding" "WARNING"
    }
    
    Write-Log "✓ Health checks completed" "SUCCESS"
}
# Cleanup old images and containers
function Invoke-Cleanup {
    Write-Log "Cleaning up old Docker images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    Write-Log "✓ Cleanup completed" "SUCCESS"
}

# Rollback function
function Invoke-Rollback {
    Write-Log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from latest backup
    $latestBackup = Get-ChildItem -Path $BackupDir | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestBackup) {
        Write-Log "Restoring from backup: $($latestBackup.Name)" "INFO"
        
        # Restore database
        $dbBackupPath = Join-Path $latestBackup.FullName "database.sql"
        if (Test-Path $dbBackupPath) {
            docker-compose -f docker-compose.prod.yml up -d postgres
            Start-Sleep -Seconds 10
            Get-Content $dbBackupPath | docker exec -i "$ProjectName-postgres-prod" psql -U stayora_user stayora_prod
        }
        
        # Restore files
        $uploadsBackupPath = Join-Path $latestBackup.FullName "uploads"
        if (Test-Path $uploadsBackupPath) {
            if (Test-Path "./uploads") {
                Remove-Item -Path "./uploads" -Recurse -Force
            }
            Copy-Item -Path $uploadsBackupPath -Destination "./" -Recurse
        }
    }
    
    Write-Log "✓ Rollback completed" "SUCCESS"
}

# Show logs
function Show-Logs {
    Write-Log "Showing application logs..."
    docker-compose -f docker-compose.prod.yml logs -f --tail=100
}

# Show usage
function Show-Usage {
    Write-Host @"
Usage: .\deploy.ps1 [ACTION]

Actions:
  deploy     - Deploy the application (default)
  rollback   - Rollback to previous version
  backup     - Create a backup of current data
  health     - Perform health checks
  logs       - Show application logs
  cleanup    - Clean up old Docker resources
  help       - Show this help message

Examples:
  .\deploy.ps1
  .\deploy.ps1 deploy
  .\deploy.ps1 health
  .\deploy.ps1 rollback
"@
}

# Main execution
try {
    switch ($Action) {
        "deploy" {
            Test-Requirements
            Backup-Data
            Deploy-Application
            Test-Health
            Invoke-Cleanup
        }
        "rollback" {
            Invoke-Rollback
        }
        "backup" {
            Backup-Data
        }
        "health" {
            Test-Health
        }
        "logs" {
            Show-Logs
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "help" {
            Show-Usage
        }
        default {
            Write-Error-Exit "Unknown action: $Action"
            Show-Usage
        }
    }
}
catch {
    Write-Error-Exit "Deployment failed: $($_.Exception.Message)"
}

Write-Log "Script execution completed." "SUCCESS"