<script setup lang="ts">
import { onMounted, ref } from "vue";
import { db } from "./db";
import type {
  HistoryItem,
  HttpMethod,
  RequestHeader,
  RequestParam,
} from "./types";
import HistorySidebar from "./components/HistorySidebar.vue";
import RequestBar from "./components/RequestBar.vue";
import KeyValueTable from "./components/KeyValueTable.vue";
import BodyEditor from "./components/BodyEditor.vue";
import ResponsePanel from "./components/ResponsePanel.vue";
import { buildUrl, parseUrl } from "./utils/url";

const method = ref<HttpMethod>("GET");
const url = ref("");
const headers = ref<RequestHeader[]>([{ key: "", value: "", active: true }]);
const params = ref<RequestParam[]>([{ key: "", value: "", active: true }]);
const body = ref("");
const activeTab = ref<"headers" | "params" | "body">("headers");

const loading = ref(false);
const error = ref("");

const history = ref<HistoryItem[]>([]);
const activeHistoryId = ref<number | undefined>(undefined);

const responseStatus = ref<number>();
const responseTime = ref<number>();
const responseBody = ref<string>();
const responseHeaders = ref<Record<string, string>>();

onMounted(loadHistory);

async function loadHistory() {
  history.value = await db.getHistory();
}

async function removeHistoryItem(id: number) {
  await db.deleteItem(id);
  if (activeHistoryId.value === id) {
    activeHistoryId.value = undefined;
    responseStatus.value = undefined;
    responseTime.value = undefined;
    responseBody.value = undefined;
    responseHeaders.value = undefined;
  }
  await loadHistory();
}

async function clearHistory() {
  if (history.value.length === 0) return;
  await db.clearHistory();
  history.value = [];
  activeHistoryId.value = undefined;
  responseStatus.value = undefined;
  responseTime.value = undefined;
  responseBody.value = undefined;
  responseHeaders.value = undefined;
}

async function loadRequest(id: number) {
  const item = await db.history.get(id);
  if (!item) return;
  activeHistoryId.value = id;
  method.value = item.method;
  const { base, params: parsedParams } = parseUrl(item.url);
  url.value = base;
  params.value = parsedParams;
  headers.value =
    item.headers.length > 0
      ? item.headers.map((h) => ({ ...h }))
      : [{ key: "", value: "", active: true }];
  body.value = item.body;
  responseStatus.value = item.responseStatus;
  responseTime.value = item.responseTime;
  responseBody.value = item.responseBody;
  responseHeaders.value = item.responseHeaders;
  activeTab.value = "headers";
}

async function sendRequest() {
  const cleanUrl = url.value.trim();
  if (!cleanUrl || loading.value) return;

  error.value = "";
  loading.value = true;

  const requestHeaders: Record<string, string> = {};
  for (const h of headers.value) {
    const key = h.key.trim();
    if (h.active && key) requestHeaders[key] = h.value;
  }

  const init: RequestInit = { method: method.value, headers: requestHeaders };
  if (method.value !== "GET") init.body = body.value || undefined;

  const targetUrl = buildUrl(cleanUrl, params.value);
  const start = performance.now();

  try {
    const res = await fetch(targetUrl, init);
    const text = await res.text();

    const collectedHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      collectedHeaders[key] = value;
    });

    responseStatus.value = res.status;
    responseHeaders.value = collectedHeaders;
    responseTime.value = Math.round(performance.now() - start);
    responseBody.value = text;
    activeHistoryId.value = undefined;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    responseStatus.value = undefined;
    responseTime.value = undefined;
    responseBody.value = undefined;
    responseHeaders.value = undefined;
  } finally {
    loading.value = false;
  }

  if (responseStatus.value !== undefined) {
    await saveToHistory(targetUrl);
  }
}

async function saveToHistory(targetUrl: string) {
  await db.addHistory({
    method: method.value,
    url: targetUrl,
    headers: headers.value.map((h) => ({ ...h })),
    params: params.value.map((p) => ({ ...p })),
    body: body.value,
    responseStatus: responseStatus.value,
    responseBody: responseBody.value,
    responseHeaders: responseHeaders.value,
    responseTime: responseTime.value,
    createdAt: Date.now(),
  });
  await loadHistory();
}
</script>

<template>
  <div
    class="flex h-full min-h-0 bg-[radial-gradient(1200px_600px_at_85%_-10%,rgba(59,130,246,0.12),transparent)] bg-[#0b0f19] text-slate-200"
  >
    <HistorySidebar
      :history="history"
      :active-id="activeHistoryId"
      @select="loadRequest"
      @remove="removeHistoryItem"
      @clear="clearHistory"
    />

    <main class="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <RequestBar
        v-model:method="method"
        v-model:url="url"
        :loading="loading"
        @send="sendRequest"
      />

      <div
        class="flex shrink-0 items-center gap-1 border-b border-[#1b2340] bg-[#0d1322] px-4 pt-2"
      >
        <button
          v-for="tab in ['headers', 'params', 'body'] as const"
          :key="tab"
          @click="activeTab = tab"
          class="rounded-t-lg px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === tab
              ? 'border border-b-0 border-[#1b2340] bg-[#0b0f19] text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          "
        >
          {{ tab === "headers" ? "Headers" : tab === "params" ? "Params" : "Body" }}
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <KeyValueTable
          v-if="activeTab === 'headers'"
          v-model:rows="headers"
          key-placeholder="Content-Type"
          value-placeholder="application/json"
          add-label="+ Agregar header"
        />

        <KeyValueTable
          v-else-if="activeTab === 'params'"
          v-model:rows="params"
          key-placeholder="page"
          value-placeholder="1"
          add-label="+ Agregar parámetro"
        />

        <div v-else class="h-full p-4">
          <BodyEditor v-model:text="body" />
        </div>
      </div>

      <p
        v-if="error"
        class="shrink-0 border-t border-[#1b2340] bg-rose-500/10 px-4 py-2 font-mono text-xs text-rose-400"
      >
        {{ error }}
      </p>

      <ResponsePanel
        :status="responseStatus"
        :time="responseTime"
        :body="responseBody"
        :headers="responseHeaders"
      />
    </main>
  </div>
</template>
