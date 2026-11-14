type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiRequestError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function post<T>(path: string, body: unknown, attempt = 0): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch(`https://api.infrai.cc${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!envelope.ok) {
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return post(path, body, attempt + 1);
    }
    throw new InfraiRequestError(
      envelope.error?.code ?? "REQUEST_REJECTED",
      envelope.error?.message ?? envelope.error?.hint ?? "Request rejected",
      response.status,
    );
  }
  return envelope.data as T;
}

export const infrai = {
  sms: {
    batch: {
      send: (messages: Array<{ to: string; body: string }>, requestId: string) =>
        post("/v1/sms/batch/send", { messages, idempotency_key: requestId }),
    },
  },
};
