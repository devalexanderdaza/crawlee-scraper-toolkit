#!/bin/bash

# Build script for Crawlee Scraper Toolkit

set -e

echo "🏗️  Building Crawlee Scraper Toolkit..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Run TypeScript compiler
echo "📦 Compiling TypeScript..."
npx tsc

# Make CLI executable
echo "🔧 Making CLI executable..."
chmod +x dist/cli/index.js

# Copy template files
echo "📋 Copying template files..."
cp -r templates/ dist/ 2>/dev/null || true

# Copy package.json for version info
echo "📄 Copying package metadata..."
cp package.json dist/

echo "✅ Build completed successfully!"

# Show build info
echo ""
echo "📊 Build Information:"
echo "   Output directory: dist/"
echo "   CLI executable: dist/cli/index.js"
echo "   Main entry: dist/index.js"
echo "   Types: dist/index.d.ts"

# Verify build
echo ""
echo "🔍 Verifying build..."
if [ -f "dist/index.js" ] && [ -f "dist/index.d.ts" ] && [ -f "dist/cli/index.js" ]; then
    echo "✅ All required files present"
else
    echo "❌ Build verification failed"
    exit 1
fi

echo ""
echo "🎉 Build process completed successfully!"

