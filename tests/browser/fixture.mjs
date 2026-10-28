import http from "node:http";
import { randomUUID } from "node:crypto";

// Backend Supabase minimo, esclusivamente in memoria: tutte le mutazioni del collaudo rimangono qui.
export async function startFixture() {
  const baseProduct = {
    category_id: null,
    name_en: null,
    width_mm: 700,
    height_mm: 439,
    depth_mm: 350,
    thickness_mm: 19.5,
    price: null,
    preview_image_url: null,
    model_url: null,
    technical_file_url: null,
    is_published: true,
    created_at: "2026-10-27T00:00:00Z",
  };
  const state = {
    products: [],
    categories: [],
    objects: new Map(),
    calls: [],
    failWrite: false,
    writeErrorCode: "23514",
    failUpload: false,
    bucketLimit: null,
  };
  // Riparte da prodotti sintetici, senza usare credenziali o record del cliente.
  function reset() {
    state.products = [
      {
        ...baseProduct,
        id: "11111111-1111-4111-8111-111111111111",
        code: "PENSILE_ORIZZONTALE_A_VISTA_SX",
        name_it: "Pensile prova",
      },
    ];
    state.categories = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Pensili",
        slug: "pensili",
        description: null,
        sort_order: 0,
      },
    ];
    state.objects.clear();
    state.calls = [];
    state.failWrite = false;
    state.writeErrorCode = "23514";
    state.failUpload = false;
    state.bucketLimit = null;
  }
  reset();
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    response.setHeader("Access-Control-Allow-Headers", "*");
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    state.calls.push({
      method: request.method,
      pathname: url.pathname,
      bytes: body.length,
    });
    // Le risposte riproducono soltanto i contratti effettivamente usati dall'SDK e dall'app.
    function json(value, status = 200) {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(value));
    }
    if (url.pathname.startsWith("/rest/v1/")) {
      const table = url.pathname.split("/").at(-1);
      if (!["products", "categories"].includes(table))
        return json({ message: "Unknown table" }, 404);
      let rows = state[table];
      for (const [field, value] of url.searchParams)
        if (value.startsWith("eq."))
          rows = rows.filter((row) => String(row[field]) === value.slice(3));
      if (request.method === "GET")
        return json(
          request.headers.accept?.includes("vnd.pgrst.object")
            ? rows[0] || null
            : rows,
        );
      if (state.failWrite)
        return json(
          {
            message: "Synthetic write rejected",
            code: state.writeErrorCode,
            details: "fixture",
          },
          400,
        );
      if (request.method === "DELETE") {
        state[table] = state[table].filter((row) => !rows.includes(row));
        return json(rows);
      }
      const input = JSON.parse(body.toString() || "{}");
      if (request.method === "POST") {
        const created = {
          ...input,
          id: randomUUID(),
          created_at: new Date().toISOString(),
        };
        state[table].push(created);
        return json(created, 201);
      }
      if (request.method === "PATCH") {
        for (const row of rows) Object.assign(row, input);
        return json(rows[0] || null);
      }
      return json({ message: "Unexpected operation" }, 400);
    }
    if (url.pathname === "/storage/v1/bucket/product-assets")
      return json({
        id: "product-assets",
        name: "product-assets",
        public: true,
        file_size_limit: state.bucketLimit,
        allowed_mime_types: null,
      });
    const signPrefix = "/storage/v1/object/upload/sign/product-assets/";
    if (url.pathname.startsWith(signPrefix)) {
      const path = decodeURIComponent(url.pathname.slice(signPrefix.length));
      if (request.method === "POST")
        return json({
          url:
            "/object/upload/sign/product-assets/" +
            path +
            "?token=synthetic-token",
        });
      if (request.method === "PUT") {
        state.objects.set(path, {
          bytes: body,
          contentType: request.headers["content-type"],
        });
        if (state.failUpload)
          return json({ message: "Synthetic upload failure" }, 500);
        return json({ Key: "product-assets/" + path }, 200);
      }
    }
    for (const action of ["info", "public"]) {
      const prefix = `/storage/v1/object/${action}/product-assets/`;
      if (!url.pathname.startsWith(prefix)) continue;
      const path = decodeURIComponent(url.pathname.slice(prefix.length));
      const object = state.objects.get(path);
      if (!object) return json({ message: "Object not found" }, 404);
      if (action === "info")
        return json({
          name: path,
          size: object.bytes.length,
          content_type: object.contentType,
        });
      const ranged = !!request.headers.range;
      response.writeHead(ranged ? 206 : 200, {
        "Content-Type": object.contentType,
      });
      response.end(ranged ? object.bytes.subarray(0, 512) : object.bytes);
      return;
    }
    if (
      url.pathname === "/storage/v1/object/product-assets" &&
      request.method === "DELETE"
    ) {
      const input = JSON.parse(body.toString());
      for (const path of input.prefixes) state.objects.delete(path);
      return json(input.prefixes.map((name) => ({ name })));
    }
    json({ message: "Unexpected fixture route" }, 404);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    state,
    reset,
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}
