
#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Run production validations
echo "📋 Running production validations..."
npm run validate:production

# Build the application
echo "🔨 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test:production

# Security scan
echo "🔒 Running security scan..."
npm audit --audit-level moderate

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t mexc-trading-app:latest .

# Tag for deployment
docker tag mexc-trading-app:latest mexc-trading-app:$(date +%Y%m%d_%H%M%S)

echo "✅ Deployment preparation complete!"
echo "🎯 Ready to deploy to production"
