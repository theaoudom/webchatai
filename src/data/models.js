// Models offered in the web chat's model selector.
//
// `id`   -> the real model name sent to the Gemini API (never shown to users).
// `name` -> the Dom-branded label shown in the UI.
//
// Keeping this mapping in one place means the UI shows our branding while the
// API still receives a valid Gemini model id.
export const MODELS = [
  {
    id: "gemini-2.5-flash-lite",
    name: "Dom Flash",
    description: "Fast and efficient — best for everyday chat.",
  },
  {
    id: "gemini-2.5-flash",
    name: "Dom Pro",
    description: "Most capable — deeper answers (limited daily usage).",
  },
  {
    id: "gemini-1.5-flash",
    name: "Dom Lite",
    description: "Lightweight — highest availability.",
  },
];

// Default selection — the fast, high-quota model.
export const DEFAULT_MODEL_ID = MODELS[0].id;

// localStorage key used to remember the user's choice across sessions.
export const MODEL_STORAGE_KEY = "domai_selected_model";

export const getModelById = (id) =>
  MODELS.find((m) => m.id === id) || MODELS[0];
