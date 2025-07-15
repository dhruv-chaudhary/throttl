# Throttl

A high-performance rate limiting service built with Bun. Throttl implements a token bucket algorithm to control request rates per domain.

## Features

- **Token Bucket Rate Limiting**: Implements a configurable token bucket algorithm
- **Per-Domain Throttling**: Rate limits are applied per domain/hostname
- **RESTful API**: Simple HTTP endpoints for configuration and checking
- **High Performance**: Built with Bun for optimal performance. Uses in-memory data structures to manage token buckets.
- **Configurable**: Customizable burst capacity and refill periods
- **No dependencies**: Does not require any dependencies like Postgres/Redis.

## Installation

```bash
bun install
```

## Usage

### Start the Server

```bash
bun run index.ts
```

The server will start on port 3000.

### API Endpoints

#### Configure Domain Rate Limits

**POST** `/api/domains`

Configure rate limiting parameters for a specific domain.

```bash
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "cap": 50,
    "periodMs": 60000
  }'
```

**Parameters:**

- `domain` (required): The domain to configure
- `cap` (optional): Maximum burst capacity (default: 30)
- `periodMs` (optional): Refill period in milliseconds (default: 60000)

#### Check Rate Limit

**GET** `/api/check?url=<url>`

Check if a request to the given URL would be allowed under current rate limits.

```bash
curl "http://localhost:3000/api/check?url=https://example.com/api/endpoint"
```

**Response:**

```json
{
  "allowed": true
}
```

or

```json
{
  "allowed": false
}
```

## Default Configuration

- **Burst Capacity**: 30 requests
- **Refill Period**: 60 seconds (60,000ms)
- **Algorithm**: Token bucket with automatic refill

## Testing

### Load Testing with wrk

```bash
wrk -t4 -c40 -d10s http://localhost:3000/api/check?url=https://example.com
```

Test Results (tested on a Macbook Pro with Apple M1 Pro Chip(10 cores) and 16GB system memory)

```bash
Running 10s test @ http://localhost:3000/api/check?url=http://example.com
  4 threads and 40 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   538.18us  142.92us   2.00ms   86.75%
    Req/Sec    18.55k     0.96k   21.10k    72.77%
  745523 requests in 10.10s, 98.83MB read
Requests/sec:  73812.83
Transfer/sec:      9.78MB
```

## How It Works

Throttl uses a token bucket algorithm:

1. Each domain gets its own bucket with a configurable capacity
2. Tokens are consumed for each request
3. Tokens refill over time based on the configured period
4. Requests are allowed if tokens are available, blocked otherwise

The algorithm ensures fair rate limiting while allowing for burst traffic within configured limits.

## Development

This project was created using Bun (v1.1.28). [Bun](https://bun.sh) is a fast all-in-one JavaScript/Typescript runtime.

## Roadmap

[ ] Setup Github actions for releasing platform specific binaries
