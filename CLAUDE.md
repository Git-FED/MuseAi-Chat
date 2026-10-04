# Coding guidance

Prefer small dependency-free changes. Validate input at the Worker boundary. Keep renderer code behind Electron context isolation. Treat all message content as untrusted text.
