#!/bin/sh
echo "Running database migration..."
node node_modules/prisma/build/index.js db push --schema=prisma/schema.prisma 2>&1 || echo "Migration warning (may be OK on first run)"
echo "Starting server..."
exec node server.js
