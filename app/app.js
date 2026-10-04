import { config, sendMessage, fetchInbox } from "./lib/messaging.js";
import { loadSettings, saveSettings } from "./lib/config.js";

const $ = (id) => document.getElementById(id);
let settings = config(loadSettings());
let watermark = Number(localStorage.getItem("museai.watermark") || 0);
let messageTotal = Number(localStorage.getItem("museai.messageTotal") || 0);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character]);
}

function setStatus(message, state = "idle") {
  $("status").textContent = message;
  $("connectionText").textContent = state === "live" ? "Connected" : state === "error" ? "Connection error" : "Not configured";
  $("statusDot").className = `status-dot ${state === "live" ? "live" : state === "error" ? "error" : ""}`;
  $("toast").textContent = message;
}

function renderSettings() {
  $("url").value = settings.url === "" ? "" : settings.url;
  $("agent").value = settings.agentId;
  $("key").value = settings.key;
  $("metricAgent").textContent = settings.agentId || "Not set";
  $("composerAgent").textContent = settings.agentId || "Not configured";
}

function renderMetrics() {
  $("messageCount").textContent = `${messageTotal} new`;
  $("lastSync").textContent = watermark ? `Last watermark ${new Date(watermark).toLocaleTimeString()}` : "Awaiting first check-in";
}

function renderMessages(messages) {
  const box = $("messages");
  if (!messages.length) {
    box.innerHTML = '<div class="empty-state" id="emptyState"><div class="empty-orbit">·</div><h3>Quiet for now</h3><p>When an agent sends you something, it will appear here. Your inbox does not need to stay open to keep messages safe.</p></div>';
    return;
  }
  box.innerHTML = messages.map((message, index) => `<article style="animation-delay:${Math.min(index * 60, 360)}ms"><b>${escapeHtml(message.from)} <span aria-hidden="true">→</span> ${escapeHtml(message.to)}</b><time>${new Date(message.ts).toLocaleString()}</time><p>${escapeHtml(message.body)}</p></article>`).join("");
}

function saveConnection() {
  settings = config({ url: $("url").value.trim(), agentId: $("agent").value.trim(), key: $("key").value });
  saveSettings(settings);
  renderSettings();
  setStatus("Connection saved locally.", settings.key && settings.url ? "live" : "idle");
}

async function pollInbox() {
  if (!settings.url || !settings.key || !settings.agentId) {
    setStatus("Save a Worker URL, agent ID, and key first.", "error");
    $("settings").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const pollButtons = [$('poll'), $('heroPoll')].filter(Boolean);
  pollButtons.forEach((button) => { button.disabled = true; button.classList.add("is-loading"); });
  try {
    const result = await fetchInbox(settings, watermark);
    renderMessages(result.messages || []);
    messageTotal += result.messages?.length || 0;
    if (result.last > watermark) {
      watermark = result.last;
      localStorage.setItem("museai.watermark", String(watermark));
      localStorage.setItem("museai.messageTotal", String(messageTotal));
    }
    $("inboxSubtitle").textContent = result.messages?.length ? `${result.messages.length} new signal${result.messages.length === 1 ? "" : "s"} received.` : `Checked ${new Date().toLocaleTimeString()} · nothing new.`;
    renderMetrics();
    setStatus("Inbox checked successfully.", "live");
  } catch (error) { setStatus(error.message || "The Worker could not be reached.", "error"); }
  finally { pollButtons.forEach((button) => { button.disabled = false; button.classList.remove("is-loading"); }); }
}

async function send() {
  const recipient = $("to").value.trim();
  const body = $("body").value.trim();
  if (!recipient || !body) { setStatus("Add a recipient and message before sending.", "error"); return; }
  if (!settings.url || !settings.key || !settings.agentId) { setStatus("Save your connection before sending.", "error"); return; }
  $("send").disabled = true;
  try {
    const result = await sendMessage(settings, recipient, body);
    $("body").value = "";
    $("characterCount").textContent = "0";
    setStatus(`Message sent · ${result.id.slice(0, 8)}`, "live");
  } catch (error) { setStatus(error.message || "Message could not be sent.", "error"); }
  finally { $("send").disabled = false; }
}

$("save").addEventListener("click", saveConnection);
$("send").addEventListener("click", send);
$("poll").addEventListener("click", pollInbox);
$("heroPoll").addEventListener("click", pollInbox);
$("body").addEventListener("input", () => { $("characterCount").textContent = $("body").value.length.toLocaleString(); });
$("themeToggle").addEventListener("click", () => { document.body.classList.toggle("high-contrast"); setStatus(document.body.classList.contains("high-contrast") ? "High-contrast mode on." : "Standard contrast restored."); });

renderSettings();
renderMetrics();
renderMessages([]);
