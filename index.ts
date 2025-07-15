type Bucket = { tokens: number; cap: number; periodMs: number; last: number };

const buckets = new Map<string, Bucket>();

// default policy
const CAP = 30; // max burst
const PERIOD = 60_000; // refill window (ms)

function bucket(domain: string): Bucket {
  const now = Date.now();
  const b = buckets.get(domain) ?? { tokens: CAP, cap: CAP, periodMs: PERIOD, last: now };
  const delta = (now - b.last) * (b.cap / b.periodMs);
  b.tokens = Math.min(b.cap, b.tokens + delta);
  b.last = now;
  buckets.set(domain, b);
  return b;
}

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/domains": {
      POST: async (req) => {
        const body = await req.json();
        const { domain, cap = CAP, periodMs = PERIOD } = body;
        buckets.set(domain, { tokens: cap, cap, periodMs, last: Date.now() });
        return Response.json({ ok: true });
      },
    },
    "/api/check": {
      GET: async (req) => {
        const url = new URL(req.url);
        const urlToCheck = url.searchParams.get("url");
        if (!urlToCheck) return Response.json({ error: "url is required" }, { status: 400 });
        let domain: string;
        try {
          domain = new URL(urlToCheck).hostname;
        } catch (err) {
          return Response.json({ error: "error parsing url" }, { status: 400 });
        }

        const b = bucket(domain);
        if (b.tokens >= 1) {
          b.tokens -= 1;
          return Response.json({ allowed: true });
        }
        return Response.json({ allowed: false });
      },
    },
    "/api/status": {
      GET: async (req) => {
        return Response.json({
          status: "ok",
          bucketCount: buckets.size,
        });
      },
    },
  },
  error(error) {
    console.error(error);
    return Response.json({ error: "internal server error" }, { status: 500 });
  },
});

console.log(`Listening on ${server.url}`);
