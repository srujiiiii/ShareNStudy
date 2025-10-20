// tiny API helper used by frontend pages
async function apiPost(url, payload) {
  const token = localStorage.getItem("token");
  const headers = token ? { "Authorization": "Bearer " + token, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    const text = await res.text().catch(()=>null);
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (err) { data = { raw: text }; }
    console.log("[apiPost]", url, "status=", res.status, "response=", data);
    return data;
  } catch (err) {
    console.error("[apiPost] fetch error", err);
    return { error: "fetch-failed", details: String(err) };
  }
}

async function apiGet(url) {
  const token = localStorage.getItem("token");
  const headers = token ? { "Authorization": "Bearer " + token } : {};
  try {
    const res = await fetch(url, { method: "GET", headers });
    const data = await res.json().catch(()=>({}));
    console.log("[apiGet]", url, "status=", res.status);
    return data;
  } catch (err) {
    console.error("[apiGet] fetch error", err);
    return {};
  }
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token } : {};
}