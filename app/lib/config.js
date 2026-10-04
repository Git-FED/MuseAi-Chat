export function loadSettings() {
  try { return JSON.parse(localStorage.getItem("museai.settings") || "{}"); } catch { return {}; }
}
export function saveSettings(settings) {
  localStorage.setItem("museai.settings", JSON.stringify(settings));
}
