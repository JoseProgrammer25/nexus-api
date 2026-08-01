<script setup lang="ts">
import { computed, ref } from "vue";
import type { HistoryItem } from "../types";
import {
  METHOD_BADGE,
  statusColor,
  statusText,
  timeAgo,
} from "../utils/format";

const props = defineProps<{
  history: HistoryItem[];
  activeId?: number;
}>();

const emit = defineEmits<{
  select: [id: number];
  remove: [id: number];
  clear: [];
}>();

const query = ref("");

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.history;
  return props.history.filter(
    (item) =>
      item.url.toLowerCase().includes(q) ||
      item.method.toLowerCase().includes(q) ||
      String(item.responseStatus ?? "").includes(q),
  );
});
</script>

<template>
  <aside
    class="flex h-full w-72 shrink-0 flex-col border-r border-[#1b2340] bg-[#0a0f1c]"
  >
    <div class="flex shrink-0 items-center justify-between px-4 py-3">
      <h1 class="text-sm font-bold uppercase tracking-widest text-slate-300">
        <span class="text-[#22d3ee]">nexus</span
        ><span class="text-[#3b82f6]">API</span>
      </h1>
      <button
        @click="emit('clear')"
        title="Vaciar historial"
        class="rounded-md p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
    </div>

    <div class="shrink-0 px-3 pb-3">
      <div class="relative">
        <svg
          class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Buscar en el historial..."
          spellcheck="false"
          class="w-full rounded-lg border border-[#232c4d] bg-[#0d1322] py-1.5 pl-8 pr-8 text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30"
        />
        <button
          v-if="query"
          @click="query = ''"
          title="Limpiar búsqueda"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 transition hover:text-slate-300"
        >
          <svg
            class="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="flex shrink-0 items-center justify-between border-b border-[#1b2340] px-4 py-2"
    >
      <span class="text-xs uppercase tracking-wide text-slate-500">Historial</span>
      <span class="rounded-full bg-[#131a2e] px-2 py-0.5 text-[10px] tabular-nums text-slate-400">
        {{ filtered.length }}
      </span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <p
        v-if="filtered.length === 0"
        class="px-4 py-8 text-center text-xs text-slate-600"
      >
        {{ query ? "Sin coincidencias." : "Sin peticiones todavía." }}
      </p>

      <div
        v-for="item in filtered"
        :key="item.id"
        @click="emit('select', item.id!)"
        class="group block w-full cursor-pointer border-b border-[#121828] px-4 py-3 transition hover:bg-[#10172a]"
        :class="{ 'bg-[#10172a]': item.id === activeId }"
      >
        <div class="flex items-center gap-2">
          <span
            class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold"
            :class="METHOD_BADGE[item.method]"
          >
            {{ item.method }}
          </span>
          <button
            @click.stop="emit('remove', item.id!)"
            title="Eliminar entrada"
            class="ml-auto rounded-md p-1 text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <div class="mt-1.5 truncate font-mono text-xs text-slate-300">
          {{ item.url }}
        </div>
        <div class="mt-1 flex items-center justify-between gap-2">
          <span class="text-[10px] text-slate-600">
            {{ timeAgo(item.createdAt) }}
          </span>
          <span
            v-if="item.responseStatus !== undefined"
            class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
            :class="statusColor(item.responseStatus)"
          >
            {{ statusText(item.responseStatus) }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
