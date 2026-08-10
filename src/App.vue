<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { db } from "./db";
import type {
  Collection,
  HistoryItem,
  HttpMethod,
  RequestHeader,
  RequestParam,
  RequestTab,
} from "./types";
import HistorySidebar from "./components/HistorySidebar.vue";
import RequestTabs from "./components/RequestTabs.vue";
import RequestBar from "./components/RequestBar.vue";
import KeyValueTable from "./components/KeyValueTable.vue";
import BodyEditor from "./components/BodyEditor.vue";
import ResponsePanel from "./components/ResponsePanel.vue";
import { buildUrl, parseUrl } from "./utils/url";
import { ensureUids, newKeyValue, supportsBody, uid } from "./utils/format";
import { fetch } from "@tauri-apps/plugin-http";

const REQUEST_TIMEOUT_MS = 60_000;

const tabs = ref<RequestTab[]>([]);
const activeTabId = ref<string>();

const activeTab = computed<RequestTab>(
  () =>
    tabs.value.find((t) => t.id === activeTabId.value) ?? tabs.value[0],
);

const loading = ref(false);
const error = ref("");

const history = ref<HistoryItem[]>([]);
const collections = ref<Collection[]>([]);
const activeHistoryId = ref<number | undefined>(undefined);

const abortController = ref<AbortController | null>(null);
let timedOut = false;
let timeoutId: ReturnType<typeof setTimeout> | undefined;

const responseHeight = ref(320);
const resizing = ref(false);

const saveModalOpen = ref(false);
const saveName = ref("");

const tabsBar = [
  { value: "headers", label: "Headers" },
  { value: "params", label: "Params" },
  { value: "body", label: "Body" },
] as const;

function emptyTab(): RequestTab {
  return {
    id: uid(),
    name: "Nueva petición",
    method: "GET",
    url: "",
    headers: [newKeyValue()],
    params: [newKeyValue()],
    body: "",
    editorTab: "headers",
  };
}

function autoName(method: HttpMethod, url: string): string {
  try {
    const u = new URL(url);
    return `${method} ${u.host}${u.pathname}`.slice(0, 40);
  } catch {
    return method;
  }
}

function ensureTab() {
  if (tabs.value.length === 0) {
    const t = emptyTab();
    tabs.value.push(t);
    activeTabId.value = t.id;
  }
}

function newTab() {
  const t = emptyTab();
  tabs.value.push(t);
  activeTabId.value = t.id;
}

function closeTab(id: string) {
  const idx = tabs.value.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tabs.value.splice(idx, 1);
  if (activeTabId.value === id) {
    const next = tabs.value[idx] ?? tabs.value[idx - 1];
    activeTabId.value = next?.id;
  }
  ensureTab();
}

function renameTab(id: string, name: string) {
  const t = tabs.value.find((x) => x.id === id);
  if (t) t.name = name;
}

function applyRequest(tab: RequestTab, item: {
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  params: RequestParam[];
  body: string;
}) {
  const { base, params: parsedParams } = parseUrl(item.url);
  tab.method = item.method;
  tab.url = base;
  tab.params = ensureUids(parsedParams);
  tab.headers =
    (item.headers ?? []).length > 0 ? ensureUids(item.headers) : [newKeyValue()];
  tab.body = item.body ?? "";
  tab.editorTab = "headers";
  if (!tab.name || tab.name === "Nueva petición") {
    tab.name = autoName(item.method, base) || "Nueva petición";
  }
}

function loadRequestFromHistory(id: number) {
  const item = history.value.find((h) => h.id === id);
  if (!item) return;
  activeHistoryId.value = id;
  const tab = activeTab.value;
  applyRequest(tab, item);
  tab.responseStatus = item.responseStatus;
  tab.responseTime = item.responseTime;
  tab.responseBody = item.responseBody;
  tab.responseHeaders = item.responseHeaders;
}

function loadCollection(c: Collection) {
  activeHistoryId.value = undefined;
  const tab = activeTab.value;
  applyRequest(tab, c);
  tab.name = c.name;
  tab.responseStatus = undefined;
  tab.responseTime = undefined;
  tab.responseBody = undefined;
  tab.responseHeaders = undefined;
}

function removeHistoryItem(id: number) {
  db.deleteItem(id);
  if (activeHistoryId.value === id) activeHistoryId.value = undefined;
  loadHistory();
}

function clearHistory() {
  if (history.value.length === 0) return;
  db.clearHistory();
  history.value = [];
  activeHistoryId.value = undefined;
}

async function removeCollection(id: number) {
  await db.deleteCollection(id);
  await loadCollections();
}

async function renameCollection(id: number, name: string) {
  await db.updateCollection(id, { name });
  await loadCollections();
}

async function loadHistory() {
  history.value = await db.getHistory();
}

async function loadCollections() {
  collections.value = await db.getCollections();
}

async function sendRequest() {
  const tab = activeTab.value;
  const cleanUrl = tab.url.trim();
  if (!cleanUrl || loading.value) return;

  error.value = "";
  loading.value = true;
  timedOut = false;

  const requestHeaders: Record<string, string> = {};
  for (const h of tab.headers) {
    const key = h.key.trim();
    if (h.active && key) requestHeaders[key] = h.value;
  }

  if (
    tab.body.trim() &&
    !Object.keys(requestHeaders).some(
      (k) => k.toLowerCase() === "content-type",
    )
  ) {
    const trimmed = tab.body.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      requestHeaders["Content-Type"] = "application/json";
    }
  }

  const init: RequestInit = { method: tab.method, headers: requestHeaders };
  if (supportsBody(tab.method) && tab.body) init.body = tab.body;

  const targetUrl = buildUrl(cleanUrl, tab.params);
  const controller = new AbortController();
  abortController.value = controller;
  timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const start = performance.now();

  try {
    const res = await fetch(targetUrl, { ...init, signal: controller.signal });
    const text = await res.text();

    const collectedHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      collectedHeaders[key] = value;
    });

    tab.responseStatus = res.status;
    tab.responseHeaders = collectedHeaders;
    tab.responseTime = Math.round(performance.now() - start);
    tab.responseBody = text;
    activeHistoryId.value = undefined;
  } catch (e) {
    const aborted = controller.signal.aborted;
    if (aborted) {
      error.value = timedOut
        ? `La petición superó el tiempo de espera (${REQUEST_TIMEOUT_MS / 1000} s).`
        : "Petición cancelada.";
    } else {
      error.value = e instanceof Error ? e.message : String(e);
    }
    tab.responseStatus = undefined;
    tab.responseTime = undefined;
    tab.responseBody = undefined;
    tab.responseHeaders = undefined;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = undefined;
    abortController.value = null;
    loading.value = false;
  }

  if (tab.responseStatus !== undefined) {
    await saveToHistory(targetUrl);
  }
}

function cancelRequest() {
  abortController.value?.abort();
}

async function saveToHistory(targetUrl: string) {
  const tab = activeTab.value;
  await db.addHistory({
    method: tab.method,
    url: targetUrl,
    headers: tab.headers.map((h) => ({ ...h })),
    params: tab.params.map((p) => ({ ...p })),
    body: tab.body,
    responseStatus: tab.responseStatus,
    responseBody: tab.responseBody,
    responseHeaders: tab.responseHeaders,
    responseTime: tab.responseTime,
    createdAt: Date.now(),
  });
  await loadHistory();
}

function openSaveModal() {
  saveName.value = activeTab.value.name;
  saveModalOpen.value = true;
}

async function confirmSaveCollection() {
  const name = saveName.value.trim();
  if (!name) return;
  const tab = activeTab.value;
  const existing = collections.value.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing?.id !== undefined) {
    await db.updateCollection(existing.id, {
      name,
      method: tab.method,
      url: buildUrl(tab.url, tab.params),
      headers: tab.headers.map((h) => ({ ...h })),
      params: tab.params.map((p) => ({ ...p })),
      body: tab.body,
    });
  } else {
    await db.addCollection({
      name,
      method: tab.method,
      url: buildUrl(tab.url, tab.params),
      headers: tab.headers.map((h) => ({ ...h })),
      params: tab.params.map((p) => ({ ...p })),
      body: tab.body,
      createdAt: Date.now(),
    });
  }
  tab.name = name;
  saveModalOpen.value = false;
  await loadCollections();
}

function startResize(e: MouseEvent) {
  e.preventDefault();
  const startY = e.clientY;
  const startH = responseHeight.value;
  resizing.value = true;
  document.body.style.userSelect = "none";

  const move = (ev: MouseEvent) => {
    const delta = startY - ev.clientY;
    responseHeight.value = Math.min(
      Math.max(startH + delta, 160),
      window.innerHeight * 0.7,
    );
  };
  const up = () => {
    resizing.value = false;
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}

function onKeydown(e: KeyboardEvent) {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "n") {
    e.preventDefault();
    newTab();
  } else if (mod && e.key.toLowerCase() === "w") {
    e.preventDefault();
    closeTab(activeTabId.value ?? activeTab.value.id);
  } else if (e.key === "Escape" && loading.value) {
    cancelRequest();
  }
}

onMounted(async () => {
  ensureTab();
  window.addEventListener("keydown", onKeydown);
  await loadHistory();
  await loadCollections();
  const latest = history.value[0];
  if (latest) {
    loadRequestFromHistory(latest.id!);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="flex h-full min-h-0 bg-base text-ink">
    <HistorySidebar
      :history="history"
      :collections="collections"
      :active-id="activeHistoryId"
      @select="loadRequestFromHistory"
      @remove="removeHistoryItem"
      @clear="clearHistory"
      @select-collection="loadCollection"
      @remove-collection="removeCollection"
      @rename-collection="renameCollection"
    />

    <main class="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <RequestTabs
        :tabs="tabs"
        :active-id="activeTabId"
        @select="activeTabId = $event"
        @close="closeTab"
        @add="newTab"
        @rename="renameTab"
      />

      <RequestBar
        :method="activeTab.method"
        :url="activeTab.url"
        :loading="loading"
        @update:method="activeTab.method = $event"
        @update:url="activeTab.url = $event"
        @send="sendRequest"
        @cancel="cancelRequest"
        @save="openSaveModal"
      />

      <div class="flex shrink-0 items-center gap-1 border-b border-edge px-3">
        <button
          v-for="tab in tabsBar"
          :key="tab.value"
          @click="activeTab.editorTab = tab.value"
          class="relative -mb-px cursor-pointer px-3 py-2.5 text-[13px] font-medium transition"
          :class="
            activeTab.editorTab === tab.value
              ? 'text-ink'
              : 'text-ink-3 hover:text-ink-2'
          "
        >
          {{ tab.label }}
          <span
            v-if="activeTab.editorTab === tab.value"
            class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
          ></span>
        </button>
      </div>

      <div class="min-h-0 flex-1">
        <KeyValueTable
          v-if="activeTab.editorTab === 'headers'"
          v-model:rows="activeTab.headers"
          key-placeholder="Content-Type"
          value-placeholder="application/json"
          add-label="Agregar header"
        />

        <KeyValueTable
          v-else-if="activeTab.editorTab === 'params'"
          v-model:rows="activeTab.params"
          key-placeholder="page"
          value-placeholder="1"
          add-label="Agregar parámetro"
        />

        <BodyEditor
          v-else
          v-model:text="activeTab.body"
          :method="activeTab.method"
        />
      </div>

      <p
        v-if="error"
        class="shrink-0 border-t border-edge bg-rose-500/10 px-4 py-2 font-mono text-xs text-rose-400"
      >
        {{ error }}
      </p>

      <div
        @mousedown="startResize"
        title="Arrastrar para redimensionar"
        class="group flex h-1.5 shrink-0 cursor-row-resize items-center justify-center border-t border-edge bg-surface transition hover:bg-surface-3"
      >
        <div
          class="h-0.5 w-10 rounded-full bg-edge-strong opacity-0 transition group-hover:opacity-100"
        ></div>
      </div>

      <div class="shrink-0" :style="{ height: `${responseHeight}px` }">
        <ResponsePanel
          :status="activeTab.responseStatus"
          :time="activeTab.responseTime"
          :body="activeTab.responseBody"
          :headers="activeTab.responseHeaders"
        />
      </div>
    </main>

    <div
      v-if="saveModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="saveModalOpen = false"
    >
      <div
        class="w-80 rounded-xl border border-edge bg-surface p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Guardar petición"
      >
        <h2 class="mb-1 text-sm font-semibold text-ink">Guardar petición</h2>
        <p class="mb-4 text-xs text-ink-3">
          Se guardará en tus colecciones para reutilizarla después.
        </p>
        <label for="save-name" class="mb-1.5 block text-xs font-medium text-ink-2">
          Nombre
        </label>
        <input
          id="save-name"
          v-model="saveName"
          @keydown.enter="confirmSaveCollection"
          @keydown.esc="saveModalOpen = false"
          type="text"
          spellcheck="false"
          autofocus
          placeholder="Ej. Obtener usuario"
          class="mb-4 w-full rounded-md border border-edge bg-surface-2 px-3 py-2 text-sm text-ink placeholder-ink-3 outline-none transition focus:border-accent-strong/60 focus:ring-2 focus:ring-accent/20"
        />
        <div class="flex justify-end gap-2">
          <button
            @click="saveModalOpen = false"
            class="cursor-pointer rounded-md px-3 py-1.5 text-[13px] text-ink-2 transition hover:bg-surface-2 hover:text-ink"
          >
            Cancelar
          </button>
          <button
            @click="confirmSaveCollection"
            class="cursor-pointer rounded-md bg-accent-strong px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-accent"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
