const courses = [
  {
    id: "cloudflare-workers",
    title: "Cloudflare Workers 入門",
    description: "JavaScript と Web API でエッジの API を作る",
    duration: "90分",
  },
  {
    id: "pages-frontend",
    title: "Pages フロントエンド連携",
    description: "静的ページから Worker の JSON を取得して表示する",
    duration: "60分",
  },
];

const events = [
  { id: 1, title: "Workers ハンズオン", date: "2026-09-18", place: "オンライン" },
  { id: 2, title: "Pages デプロイ相談会", date: "2026-09-25", place: "専科ラボ" },
];

function getAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  const allowedOrigins = (env.ALLOWED_ORIGINS || "*").split(",").map((item) => item.trim());
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin) ? origin || "*" : "null";
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "access-control-allow-origin": getAllowedOrigin(request, env),
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": getAllowedOrigin(request, env),
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type",
        },
      });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, request, env);
    }

    if (url.pathname === "/api") {
      return json({
        name: "senka-api",
        status: "ok",
        endpoints: ["/api/course", "/api/hello?name=山田", "/api/fortune", "/api/events"],
      }, 200, request, env);
    }

    if (url.pathname === "/api/course") {
      return json({ courses }, 200, request, env);
    }

    if (url.pathname === "/api/hello") {
      const name = url.searchParams.get("name")?.trim();
      if (!name) {
        return json({ error: "name is required" }, 400, request, env);
      }
      return json({ message: `こんにちは、${name}さん！` }, 200, request, env);
    }

    if (url.pathname === "/api/fortune") {
      const fortunes = ["大吉", "中吉", "小吉", "吉"];
      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % fortunes.length;
      const fortune = fortunes[randomIndex];
      return json({ fortune, message: "小さな一歩が、次の発見につながります。" }, 200, request, env);
    }

    if (url.pathname === "/api/events") {
      return json({ events }, 200, request, env);
    }

    return json({ error: "Not found" }, 404, request, env);
  },
};