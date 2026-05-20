import { getStore } from "@netlify/blobs";

const STORE_NAME = "food-mukit-list";
const DATA_KEY = "seonyoon-giwoong-items";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders
  });
}

export default async function handler(request) {
  try {
    const store = getStore({
      name: STORE_NAME,
      consistency: "strong"
    });

    if (request.method === "GET") {
      const saved = await store.get(DATA_KEY, {
        type: "json",
        consistency: "strong"
      });

      return json(saved || { items: [] });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];

      await store.setJSON(DATA_KEY, {
        items,
        updatedAt: new Date().toISOString()
      });

      return json({ ok: true, count: items.length });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    return json({
      error: "Server error",
      message: error.message
    }, 500);
  }
}
