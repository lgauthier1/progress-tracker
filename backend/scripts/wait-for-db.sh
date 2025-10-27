#!/bin/bash
# Wait for PostgreSQL to be ready

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "⏳ Waiting for PostgreSQL at $host:$port..."

until PGPASSWORD=postgres psql -h "$host" -p "$port" -U "postgres" -c '\q' 2>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "✅ PostgreSQL is up - executing command"
exec $cmd

