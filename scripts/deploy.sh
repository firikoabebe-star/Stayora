#!/bin/bash

# Stayora Production Deployment Script
# This script handles the complete deployment process for the Stayora application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="stayora"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Create directories if they don't exist
mkdir -p logs backups

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if required files exist
check_requirements() {
    log "Checking deployment requirements..."
    
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found. Please create it with production environment variables."
    fi
    
    if [ ! -f "docker-compose.prod.yml" ]; then
        error "docker-compose.prod.yml not found."
    fi
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed."
    fi
    
    log "✓ All requirements satisfied"
}

# Backup existing data
backup_data() {
    log "Creating backup of existing data..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup-$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database if container exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "${PROJECT_NAME}-postgres"; then
        info "Backing up PostgreSQL database..."
        docker exec "${PROJECT_NAME}-postgres-prod" pg_dump -U stayora_user stayora_prod > "$BACKUP_PATH/database.sql" || warning "Database backup failed"
    fi
    
    # Backup uploaded files if they exist
    if [ -d "./uploads" ]; then
        info "Backing up uploaded files..."
        cp -r ./uploads "$BACKUP_PATH/" || warning "File backup failed"
    fi
    
    log "✓ Backup created at $BACKUP_PATH"
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Pull latest images and build
    info "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Stop existing containers
    info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    info "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    info "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate || warning "Migration failed"
    
    log "✓ Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check if containers are running
    CONTAINERS=("${PROJECT_NAME}-postgres-prod" "${PROJECT_NAME}-redis-prod" "${PROJECT_NAME}-backend-prod" "${PROJECT_NAME}-frontend-prod" "${PROJECT_NAME}-nginx-prod")
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps --format 'table {{.Names}}' | grep -q "$container"; then
            info "✓ $container is running"
        else
            warning "✗ $container is not running"
        fi
    done
    
    # Check application endpoints
    info "Checking application endpoints..."
    
    # Backend health check
    if curl -f -s http://localhost:5000/health > /dev/null; then
        info "✓ Backend API is responding"
    else
        warning "✗ Backend API is not responding"
    fi
    
    # Frontend health check
    if curl -f -s http://localhost:3000 > /dev/null; then
        info "✓ Frontend is responding"
    else
        warning "✗ Frontend is not responding"
    fi
    
    log "✓ Health checks completed"
}
# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes (be careful with this in production)
    # docker volume prune -f
    
    log "✓ Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        info "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database
        if [ -f "$BACKUP_DIR/$LATEST_BACKUP/database.sql" ]; then
            docker-compose -f docker-compose.prod.yml up -d postgres
            sleep 10
            docker exec -i "${PROJECT_NAME}-postgres-prod" psql -U stayora_user stayora_prod < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
        fi
        
        # Restore files
        if [ -d "$BACKUP_DIR/$LATEST_BACKUP/uploads" ]; then
            rm -rf ./uploads
            cp -r "$BACKUP_DIR/$LATEST_BACKUP/uploads" ./
        fi
    fi
    
    log "✓ Rollback completed"
}

# Show logs
show_logs() {
    log "Showing application logs..."
    docker-compose -f docker-compose.prod.yml logs -f --tail=100
}

# Show usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  deploy     - Deploy the application"
    echo "  rollback   - Rollback to previous version"
    echo "  backup     - Create a backup of current data"
    echo "  health     - Perform health checks"
    echo "  logs       - Show application logs"
    echo "  cleanup    - Clean up old Docker resources"
    echo "  help       - Show this help message"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            check_requirements
            backup_data
            deploy
            health_check
            cleanup
            ;;
        "rollback")
            rollback
            ;;
        "backup")
            backup_data
            ;;
        "health")
            health_check
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            usage
            ;;
        *)
            error "Unknown option: $1"
            usage
            ;;
    esac
}

# Trap errors and cleanup
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"