#!/bin/bash

# Package Documentation Script
# Creates a compressed archive of the documentation for distribution
# Usage: ./scripts/package-docs.sh [output-path]

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Default output path
readonly DEFAULT_OUTPUT="docs-archive.tar.gz"
readonly OUTPUT_PATH="${1:-${DEFAULT_OUTPUT}}"

log() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

main() {
    cd "${PROJECT_ROOT}"
    
    log "📦 Packaging documentation..."
    
    # Check if docs directory exists
    if [[ ! -d "docs" ]]; then
        warn "📚 Documentation directory not found. Generating documentation first..."
        if ! pnpm run docs:build; then
            error "Failed to generate documentation"
            exit 1
        fi
    fi
    
    # Check if docs directory has content
    if [[ -z "$(ls -A docs)" ]]; then
        error "Documentation directory is empty. Run 'pnpm run docs:build' first."
        exit 1
    fi
    
    # Remove existing archive if it exists
    if [[ -f "${OUTPUT_PATH}" ]]; then
        warn "🗑️  Removing existing archive: ${OUTPUT_PATH}"
        rm -f "${OUTPUT_PATH}"
    fi
    
    # Create the archive
    log "📦 Creating archive: ${OUTPUT_PATH}"
    if cd docs && tar -czf "../${OUTPUT_PATH}" .; then
        cd ..
        
        # Get archive info
        local size
        size=$(du -h "${OUTPUT_PATH}" | cut -f1)
        local file_count
        file_count=$(tar -tzf "${OUTPUT_PATH}" | wc -l)
        
        success "📦 Documentation archive created successfully!"
        log "   📁 File: ${OUTPUT_PATH}"
        log "   📏 Size: ${size}"
        log "   📄 Files: ${file_count}"
        
        # List top-level contents
        log "📋 Archive contents (top-level):"
        tar -tzf "${OUTPUT_PATH}" | head -20 | sed 's/^/   /'
        
        if [[ $(tar -tzf "${OUTPUT_PATH}" | wc -l) -gt 20 ]]; then
            log "   ... and $((file_count - 20)) more files"
        fi
        
    else
        error "Failed to create documentation archive"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
📦 Package Documentation Script

USAGE:
    $0 [output-path]

DESCRIPTION:
    Creates a compressed archive (.tar.gz) of the documentation directory
    for distribution as a release asset.

OPTIONS:
    output-path    Path for the output archive (default: docs-archive.tar.gz)
    -h, --help     Show this help message

EXAMPLES:
    $0                                    # Create docs-archive.tar.gz
    $0 my-docs.tar.gz                    # Create my-docs.tar.gz
    $0 releases/docs-v1.0.0.tar.gz       # Create in releases directory

REQUIREMENTS:
    - docs/ directory with generated documentation
    - tar command available
    - gzip compression support

EOF
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
