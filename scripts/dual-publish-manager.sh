#!/bin/bash

# Dual Registry Publication Management Script
# Provides utilities for managing dual publication to NPM and GitHub Packages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_info() {
    print_color $BLUE "ℹ️  $1"
}

print_success() {
    print_color $GREEN "✅ $1"
}

print_warning() {
    print_color $YELLOW "⚠️  $1"
}

print_error() {
    print_color $RED "❌ $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v pnpm &> /dev/null; then
        missing_deps+=("pnpm")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to validate environment
validate_environment() {
    print_info "Validating environment..."
    
    if [ -z "$NPM_TOKEN" ] && [ -z "$NODE_AUTH_TOKEN" ]; then
        print_warning "NPM_TOKEN or NODE_AUTH_TOKEN not set"
        echo "  Set one of these environment variables for NPM publication"
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN not set"
        echo "  Set GITHUB_TOKEN environment variable for GitHub Packages publication"
    fi
    
    # Check if logged into npm
    if npm whoami &> /dev/null; then
        local npm_user=$(npm whoami)
        print_success "Logged into NPM as: $npm_user"
    else
        print_warning "Not logged into NPM"
        echo "  Run 'npm login' or set NPM_TOKEN"
    fi
}

# Function to setup .npmrc for dual publication
setup_npmrc() {
    print_info "Setting up .npmrc for dual publication..."
    
    if [ -f ".npmrc" ]; then
        print_warning ".npmrc already exists"
        echo "  Backup will be created as .npmrc.backup"
        cp .npmrc .npmrc.backup
    fi
    
    if [ -f ".npmrc.example" ]; then
        cp .npmrc.example .npmrc
        print_success ".npmrc created from example"
        echo "  Review and customize .npmrc for your needs"
    else
        cat > .npmrc << EOF
# NPM Registry Configuration for Dual Publication
registry=https://registry.npmjs.org/
@devalexanderdaza:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
access=public
package-lock=false
EOF
        print_success ".npmrc created with default configuration"
    fi
}

# Function to run validation
run_validation() {
    print_info "Running dual publication validation..."
    
    if pnpm run validate:dual-publish; then
        print_success "Validation passed"
    else
        print_error "Validation failed"
        echo "  Address the issues above before proceeding"
        exit 1
    fi
}

# Function to run E2E test
run_e2e_test() {
    print_info "Running E2E test..."
    
    if pnpm run test:dual-publish; then
        print_success "E2E test passed"
    else
        print_error "E2E test failed"
        echo "  Check the test results above"
        exit 1
    fi
}

# Function to prepare for release
prepare_release() {
    print_info "Preparing for release..."
    
    # Run build
    print_info "Building project..."
    pnpm run build
    
    # Run tests
    print_info "Running tests..."
    pnpm test
    
    # Generate docs
    print_info "Generating documentation..."
    pnpm run docs
    
    print_success "Release preparation complete"
}

# Function to preview release
preview_release() {
    print_info "Previewing release..."
    
    if pnpm run release:preview; then
        print_success "Release preview completed"
    else
        print_warning "Release preview had issues"
        echo "  Check the output above for details"
    fi
}

# Function to publish in dry-run mode
dry_run_publish() {
    print_info "Running publication dry-run..."
    
    # Set environment for dry-run
    export DRY_RUN=true
    
    print_info "Dry-run: NPM publication"
    npm publish --dry-run || print_warning "NPM dry-run had issues"
    
    print_info "Dry-run: GitHub Packages publication"
    # Note: GitHub Packages doesn't have a built-in dry-run, so we simulate
    echo "  Would publish to: https://npm.pkg.github.com/@devalexanderdaza/crawlee-scraper-toolkit"
    
    print_success "Dry-run completed"
}

# Function to show usage
show_usage() {
    echo "Dual Registry Publication Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check-deps     Check if all dependencies are installed"
    echo "  validate       Validate environment and configuration"
    echo "  setup-npmrc    Setup .npmrc for dual publication"
    echo "  test           Run validation and E2E tests"
    echo "  prepare        Prepare project for release (build, test, docs)"
    echo "  preview        Preview what would be released"
    echo "  dry-run        Run publication in dry-run mode"
    echo "  full-check     Run all checks and validations"
    echo "  help           Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  NPM_TOKEN      Token for NPM publication"
    echo "  GITHUB_TOKEN   Token for GitHub Packages publication"
    echo ""
    echo "Examples:"
    echo "  $0 full-check          # Run all validations"
    echo "  $0 setup-npmrc         # Setup .npmrc configuration"
    echo "  $0 dry-run            # Test publication without actually publishing"
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        check-deps)
            check_dependencies
            ;;
        validate)
            check_dependencies
            validate_environment
            ;;
        setup-npmrc)
            setup_npmrc
            ;;
        test)
            check_dependencies
            run_validation
            run_e2e_test
            ;;
        prepare)
            check_dependencies
            prepare_release
            ;;
        preview)
            check_dependencies
            preview_release
            ;;
        dry-run)
            check_dependencies
            validate_environment
            dry_run_publish
            ;;
        full-check)
            check_dependencies
            validate_environment
            run_validation
            run_e2e_test
            print_success "All checks passed! Ready for dual publication."
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
