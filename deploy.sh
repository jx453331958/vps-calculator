#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_info "Docker is available"
}

deploy() {
    print_info "Starting deployment..."
    check_docker

    print_info "Pulling latest image..."
    docker compose pull

    print_info "Starting containers..."
    docker compose up -d

    print_info "Waiting for service to be ready..."
    sleep 3

    if docker compose ps | grep -q "Up"; then
        print_info "Deployment successful!"
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  VPS Calculator is now running!${NC}"
        echo -e "${GREEN}  Access: http://localhost:3457${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        print_error "Deployment failed. Check logs with: docker compose logs"
        exit 1
    fi
}

update() {
    print_info "Starting update..."
    check_docker

    print_info "Pulling latest image..."
    docker compose pull

    print_info "Restarting containers with new image..."
    docker compose up -d

    print_info "Waiting for service to be ready..."
    sleep 3

    if docker compose ps | grep -q "Up"; then
        print_info "Update successful!"
    else
        print_error "Update failed. Check logs with: docker compose logs"
        exit 1
    fi
}

stop() {
    print_info "Stopping service..."
    docker compose down
    print_info "Service stopped"
}

restart() {
    print_info "Restarting service..."
    docker compose restart
    print_info "Service restarted"
}

logs() {
    docker compose logs -f --tail=100
}

status() {
    echo ""
    print_info "Container status:"
    docker compose ps
    echo ""
    print_info "Recent logs:"
    docker compose logs --tail=20
}

clean() {
    print_warn "This will remove containers and images."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down --rmi all
        print_info "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

show_help() {
    echo "VPS Calculator Deployment Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  deploy   - First-time deployment (pull + start)"
    echo "  update   - Pull latest image and restart"
    echo "  start    - Start the service"
    echo "  stop     - Stop the service"
    echo "  restart  - Restart the service"
    echo "  status   - Show service status and recent logs"
    echo "  logs     - Follow container logs"
    echo "  clean    - Remove containers and images"
    echo "  help     - Show this help message"
}

case "${1:-}" in
    deploy)  deploy ;;
    update)  update ;;
    start)   docker compose up -d; print_info "Service started" ;;
    stop)    stop ;;
    restart) restart ;;
    status)  status ;;
    logs)    logs ;;
    clean)   clean ;;
    help|--help|-h) show_help ;;
    *)
        if [ -z "${1:-}" ]; then
            show_help
        else
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
        fi
        ;;
esac
