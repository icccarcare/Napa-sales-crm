import { supabase } from "./supabase";

// App (camelCase) <-> Postgres (snake_case)
const MAP = {
  id: "id", name: "name", type: "type", town: "town", address: "address",
  fullAddress: "full_address", phone: "phone", contact: "contact", email: "email",
  rating: "rating", reviews: "reviews", priority: "priority", status: "status",
  acctNum: "acct_num", monthlySpend: "monthly_spend", supplier: "supplier",
  lastVisit: "last_visit", lastCall: "last_call", nextFollowUp: "next_follow_up",
  notes: "notes", relScore: "rel_score", isStocking: "is_stocking",
  lat: "lat", lng: "lng", competitor: "competitor", repName: "rep_name",
  lostReason: "lost_reason", inventory: "inventory", callLog: "call_log",
  spendHistory: "spend_history", reorderHistory: "reorder_history",
};
const JSON_FIELDS = new Set(["inventory", "callLog", "spendHistory", "reorderHistory"]);

// Inventory parts may have been loaded in an older format (part / min_stock / on_hand,
// singular category names, no ids). Translate everything to the format the app uses.
function normCategory(raw) {
  const c = String(raw || "").toLowerCase();
  if (c.includes("cabin")) return "Cabin Air Filters";
  if (c.includes("oil")) return "Oil Filters";
  if (c.includes("fuel")) return "Fuel Filters";
  if (c.includes("air")) return "Air Filters";
  if (c.includes("batter")) return "Batteries";
  if (c.includes("wiper")) return "Wiper Blades";
  if (c.includes("chem")) return "Chemicals";
  if (c.includes("consum")) return "Consumables";
  return "Other";
}
function normInventory(inv) {
  return (Array.isArray(inv) ? inv : []).map((i, idx) => {
    const category = normCategory(i.category);
    const singular = String(i.category || "").trim();
    return {
      ...i,
      id: i.id || `inv-${idx}`,
      partNum: String(i.partNum ?? i.part ?? ""),
      description: i.description || singular || category.replace(/s$/, ""),
      parLevel: parseInt(i.parLevel ?? i.min_stock) || 0,
      currentStock: parseInt(i.currentStock ?? i.on_hand) || 0,
      category,
    };
  });
}

export function fromRow(r) {
  const c = {};
  for (const [k, col] of Object.entries(MAP)) c[k] = r[col];
  for (const k of JSON_FIELDS) c[k] = c[k] || [];
  c.inventory = normInventory(c.inventory);
  c.lat = c.lat ?? 0; c.lng = c.lng ?? 0;
  return c;
}

export function toRow(c, { withId = true } = {}) {
  const r = {};
  for (const [k, col] of Object.entries(MAP)) {
    if (k === "id" && !withId) continue;
    if (c[k] !== undefined) r[col] = c[k];
  }
  return r;
}

export async function loadCustomers() {
  // Supabase returns max 1000 rows per request; we have ~84, so one page is plenty.
  const { data, error } = await supabase.from("customers").select("*").order("id");
  if (error) throw error;
  return data.map(fromRow);
}

export async function saveCustomer(c) {
  const { error } = await supabase.from("customers").upsert(toRow(c));
  if (error) throw error;
}

export async function insertCustomer(c) {
  // Let the database assign the id (the app's Date.now() id is discarded).
  const { data, error } = await supabase.from("customers").insert(toRow(c, { withId: false })).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function removeCustomer(id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}
