# Dev Setup

## Bootstrap
```bash
set -e
brew install postgresql
initdb .postgres
postgres -D .postgres
createdb p2p
createuser -s p2padmin
```

## Startup
```bash
postgres -D .postgres
```
