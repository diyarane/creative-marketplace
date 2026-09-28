// End-to-end workflow check against a running server (default http://localhost:3000)
const BASE = process.env.BASE_URL || "http://localhost:3000";
class Client {
  cookie = "";
  async req(method, path, body) {
    const res = await fetch(BASE + path, { method, redirect: "manual", headers: { "Content-Type": "application/json", cookie: this.cookie }, body: body ? JSON.stringify(body) : undefined });
    const sc = res.headers.getSetCookie?.() ?? [];
    for (const c of sc) this.cookie = c.split(";")[0];
    let json = null; try { json = await res.json(); } catch {}
    return { status: res.status, json, data: json?.data, error: json?.error };
  }
  login(email) { return this.req("POST", "/api/auth/login", { email, password: "Password123!" }); }
}
let step = 0, failed = 0;
function check(label, cond, extra = "") { step++; const ok = !!cond; if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"} ${String(step).padStart(2)}. ${label} ${ok ? "" : extra}`); }

const client = new Client(), creator = new Client(), admin = new Client();
let r = await client.login("client@example.com"); check("Client login", r.status === 200 && r.data.role === "CLIENT", JSON.stringify(r.json));
r = await client.req("GET", "/api/creators"); check("Browse creators (8+)", r.data?.length >= 8);
const creatorId = r.data[0].id;
r = await client.req("GET", `/api/creators/${creatorId}`); check("Open creator profile w/ portfolio + services", r.data?.portfolioItems?.length > 0 && r.data?.services?.length > 0);
r = await client.req("POST", "/api/projects", { title: "E2E Test Launch Film", category: "Motion Graphics", description: "A thirty second launch film for our new product line with kinetic type.", requirements: "16:9 and 9:16 exports, brand colors provided.", budgetMin: 1000, budgetMax: 2000, deadline: new Date(Date.now() + 14 * 864e5).toISOString(), publish: true });
check("Create + publish project (OPEN)", r.status === 200 && r.data.status === "OPEN", JSON.stringify(r.json));
const pid = r.data.id;
r = await client.req("POST", "/api/projects", { title: "x", category: "", description: "short", requirements: "", budgetMin: -1, budgetMax: 0, deadline: "2001-01-01" });
check("Invalid project rejected (422)", r.status === 422);

r = await creator.login("creator@example.com"); check("Creator login", r.status === 200 && r.data.role === "CREATOR");
r = await creator.req("GET", "/api/projects/opportunities"); check("Creator sees new opportunity", r.data?.some((p) => p.id === pid));
r = await creator.req("POST", `/api/projects/${pid}/proposals`, { price: 1500, deliveryDays: 8, message: "I would love to craft this film with kinetic type and tight pacing.", revisionsIncluded: 2 });
check("Submit proposal", r.status === 200, JSON.stringify(r.json));
const proposalId = r.data?.id;
r = await creator.req("POST", `/api/projects/${pid}/proposals`, { price: 1500, deliveryDays: 8, message: "Duplicate proposal attempt should fail here.", revisionsIncluded: 2 });
check("Duplicate proposal blocked (409)", r.status === 409);
r = await creator.req("POST", `/api/proposals/${proposalId}/accept`); check("Creator cannot accept proposal (403)", r.status === 403);

r = await client.req("GET", `/api/projects/${pid}/proposals`); check("Client sees proposal; project PROPOSALS_RECEIVED", r.data?.length === 1);
r = await client.req("GET", `/api/projects/${pid}`); check("Status is PROPOSALS_RECEIVED", r.data?.status === "PROPOSALS_RECEIVED");
r = await client.req("POST", `/api/projects/${pid}/approve`); check("Invalid transition blocked (409)", r.status === 409);
r = await client.req("POST", `/api/proposals/${proposalId}/accept`); check("Accept proposal -> FREELANCER_SELECTED", r.data?.status === "FREELANCER_SELECTED" && r.data?.creatorId, JSON.stringify(r.json));

r = await creator.req("POST", `/api/projects/${pid}/start`); check("Creator opens project & starts (IN_PROGRESS)", r.data?.status === "IN_PROGRESS");
r = await creator.req("POST", `/api/projects/${pid}/submit`, { fileName: "launch-film-v1.mp4", note: "First cut" }); check("Submit work (SUBMITTED)", r.data?.status === "SUBMITTED", JSON.stringify(r.json));
r = await client.req("POST", `/api/projects/${pid}/revisions`, { description: "Please speed up the intro and warm the color grade." }); check("Client requests revision", r.status === 200, JSON.stringify(r.json));
r = await client.req("GET", `/api/projects/${pid}`); check("Status REVISION_REQUESTED", r.data?.status === "REVISION_REQUESTED");
r = await creator.req("POST", `/api/projects/${pid}/submit`, { fileName: "launch-film-v2.mp4", note: "Revised" }); check("Creator resubmits (SUBMITTED)", r.data?.status === "SUBMITTED");
r = await client.req("GET", `/api/projects/${pid}/revisions`); check("Revision marked RESOLVED", r.data?.[0]?.status === "RESOLVED");
r = await client.req("POST", `/api/projects/${pid}/approve`); check("Approve work (APPROVED)", r.data?.status === "APPROVED");
r = await client.req("POST", `/api/projects/${pid}/payment`, { method: "CARD", cardNumber: "4000 0000 0000 0000" }); check("Declined card fails, project back to APPROVED", r.data?.success === false);
r = await client.req("GET", `/api/projects/${pid}`); check("Status APPROVED after failed payment", r.data?.status === "APPROVED");
r = await client.req("POST", `/api/projects/${pid}/payment`, { method: "CARD", cardNumber: "4242 4242 4242 4242" }); check("Mock payment succeeds", r.data?.success === true && r.data.payment.transactionId.startsWith("txn_"), JSON.stringify(r.json));
r = await client.req("GET", `/api/projects/${pid}`); check("Project COMPLETED", r.data?.status === "COMPLETED");
r = await client.req("POST", `/api/projects/${pid}/reviews`, { rating: 5, comment: "Outstanding work, delivered fast and revised gracefully." }); check("Client leaves review", r.status === 200, JSON.stringify(r.json));
r = await client.req("POST", `/api/projects/${pid}/reviews`, { rating: 4, comment: "Trying to double review this project." }); check("Duplicate review blocked (409)", r.status === 409);
r = await creator.req("POST", `/api/projects/${pid}/reviews`, { rating: 5, comment: "Great client with clear direction throughout." }); check("Creator reviews client", r.status === 200);
const me = await creator.req("GET", "/api/creators/profile");
r = await client.req("GET", `/api/creators/${me.data.id}`); check("Review appears on creator profile + aggregate updated", r.data?.reviews?.some((x) => x.projectId === pid) && r.data.totalReviews >= 2);
r = await creator.req("GET", "/api/notifications"); check("Creator has notifications (accept, revision, payment)", ["PROPOSAL_ACCEPTED", "REVISION_REQUESTED", "PAYMENT_COMPLETED"].every((t) => r.data.some((n) => n.type === t)));

// authorization
r = await client.req("GET", "/api/admin/stats"); check("Client blocked from admin API (403)", r.status === 403);
r = await creator.req("POST", "/api/projects", {}); check("Creator blocked from creating projects (403)", r.status === 403);
r = await new Client().req("GET", "/api/projects"); check("Anonymous blocked (401)", r.status === 401);
r = await admin.login("admin@example.com"); r = await admin.req("GET", "/api/admin/stats"); check("Admin stats load", r.status === 200 && r.data.totalUsers > 0);
r = await new Client().req("POST", "/api/auth/register", { name: "Bad", email: "bad", password: "x", role: "ADMIN" }); check("Registration validation (422)", r.status === 422);
const reg = new Client(); const email = `e2e${Date.now()}@example.com`;
r = await reg.req("POST", "/api/auth/register", { name: "New Person", email, password: "Password123!", role: "CLIENT" }); check("Registration works", r.status === 200);
r = await new Client().req("POST", "/api/auth/register", { name: "New Person", email, password: "Password123!", role: "CLIENT" }); check("Duplicate email blocked (409)", r.status === 409);

// page-level protection (proxy)
const pageRes = await fetch(BASE + "/admin", { redirect: "manual", headers: { cookie: client.cookie } }); check("Client redirected away from /admin", pageRes.status >= 300 && pageRes.status < 400 && pageRes.headers.get("location")?.includes("/unauthorized"));
const anon = await fetch(BASE + "/projects", { redirect: "manual" }); check("Anonymous redirected to /login", anon.headers.get("location")?.includes("/login"));
for (const path of ["/", "/explore", "/subscription", "/login", "/register"]) { const p = await fetch(BASE + path); check(`Public page ${path} -> 200`, p.status === 200); }
for (const [who, c, path] of [["client", client, "/dashboard/client"], ["creator", creator, "/dashboard/creator"], ["admin", admin, "/admin"], ["creator", creator, "/earnings"], ["client", client, `/projects/${pid}`]]) { const p = await fetch(BASE + path, { headers: { cookie: c.cookie } }); check(`${who} page ${path} -> 200`, p.status === 200); }
console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll checks passed"); process.exit(failed ? 1 : 0);
