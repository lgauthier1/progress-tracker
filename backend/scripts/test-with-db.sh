#!/bin/bash
# Run tests with Docker PostgreSQL

set -e

echo "🐳 Starting test database..."
cd "$(dirname "$0")/../.."
docker-compose -f docker-compose.test.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 3

# Wait for PostgreSQL to be ready
until docker exec habits-tracker-test-db pg_isready -U postgres > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

echo "✅ Database is ready!"

echo "🔄 Running migrations..."
cd backend
export $(cat .env.test | grep -v '^#' | xargs)
npm run db:migrate:deploy

echo "🧪 Running tests..."
npm run test

TEST_EXIT_CODE=$?

echo "🧹 Cleaning up..."
cd ..
docker-compose -f docker-compose.test.yml down

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Tests failed with exit code $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE

