#!/bin/bash

echo "Waiting for API to be ready..."
sleep 5

echo "Initializing database schema..."
docker exec airport-api npm run init-db

echo "Importing sample airports..."
docker exec airport-api npm run import-airports

echo ""
echo "✅ Done! Your airport API is ready at http://localhost:3333"
echo ""
echo "Test it:"
echo "  curl http://localhost:3333/api/airports"
