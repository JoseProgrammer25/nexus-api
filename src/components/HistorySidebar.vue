<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import type { Collection, HistoryItem } from "../types";
import {
  METHOD_BADGE,
  statusColor,
  statusDot,
  statusText,
  timeAgo,
} from "../utils/format";

const props = defineProps<{
  history: HistoryItem[];
  collections: Collection[];
  activeId?: number;
}>();

const emit = defineEmits<{
  select: [id: number];
  remove: [id: number];
  clear: [];
  "select-collection": [collection: Collection];
  "remove-collection": [id: number];
  "rename-collection": [id: number, name: string];
}>();

const query = ref("");
const view = ref<"history" | "saved">("history");

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

const editingId = ref<number | null>(null);
const editingName = ref("");

function startRename(c: Collection) {
  editingId.value = c.id ?? null;
  editingName.value = c.name;
  nextTick();
}

function commitRename() {
  if (editingId.value !== null) {
    emit("rename-collection", editingId.value, editingName.value.trim() || "Colección");
  }
  editingId.value = null;
}
</script>

<template>
  <aside class="flex h-full w-72 shrink-0 flex-col border-r border-edge bg-surface">
    <div class="flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-4">
      <img src="/nexus.svg" alt="Nexus API" class="h-6 w-6 shrink-0" />
      <span class="text-sm font-semibold tracking-tight text-ink">Nexus</span>
      <span
        class="rounded border border-edge px-1 py-px text-[9px] font-semibold uppercase tracking-widest text-ink-3"
      >
        API
      </span>
      <button
        @click="emit('clear')"
        title="Vaciar historial"
        class="ml-auto cursor-pointer rounded-md p-1.5 text-ink-3 transition hover:bg-rose-500/10 hover:text-rose-400"
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
      <div class="flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5">
        <button
          @click="view = 'history'"
          class="flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition"
          :class="
            view === 'history'
              ? 'bg-surface-3 text-ink'
              : 'text-ink-3 hover:text-ink-2'
          "
        >
          Historial
        </button>
        <button
          @click="view = 'saved'"
          class="flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition"
          :class="
            view === 'saved'
              ? 'bg-surface-3 text-ink'
              : 'text-ink-3 hover:text-ink-2'
          "
        >
          Guardadas
        </button>
      </div>
    </div>

    <div v-if="view === 'history'" class="shrink-0 px-3 pb-3">
      <div class="relative">
        <svg
          class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
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
          placeholder="Buscar..."
          spellcheck="false"
          class="w-full rounded-md border border-edge bg-surface-2 py-1.5 pl-8 pr-7 text-xs text-ink placeholder-ink-3 outline-none transition focus:border-accent-strong/60 focus:ring-2 focus:ring-accent/20"
        />
        <button
          v-if="query"
          @click="query = ''"
          title="Limpiar búsqueda"
          class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-ink-3 transition hover:text-ink-2"
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

    <div class="flex shrink-0 items-center justify-between border-y border-edge px-4 py-2">
      <span class="text-[11px] font-medium uppercase tracking-wider text-ink-3">
        {{ view === "history" ? "Historial" : "Colecciones" }}
      </span>
      <span class="text-[11px] tabular-nums text-ink-3">
        {{ view === "history" ? filtered.length : props.collections.length }}
      </span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto py-1">
      <template v-if="view === 'history'">
        <p
          v-if="filtered.length === 0"
          class="px-4 py-8 text-center text-xs text-ink-3"
        >
          {{ query ? "Sin coincidencias." : "Sin peticiones todavía." }}
        </p>

        <div
          v-for="item in filtered"
          :key="item.id"
          @click="emit('select', item.id!)"
          class="group relative cursor-pointer px-4 py-2.5 transition hover:bg-surface-2/60"
          :class="{ 'bg-surface-2/70': item.id === activeId }"
        >
          <span
            v-if="item.id === activeId"
            class="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent"
          ></span>

          <div class="flex items-center gap-2">
            <span
              class="w-12 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[10px] font-semibold"
              :class="METHOD_BADGE[item.method]"
            >
              {{ item.method }}
            </span>
            <span class="ml-auto text-[10px] tabular-nums text-ink-3">
              {{ timeAgo(item.createdAt) }}
            </span>
            <button
              @click.stop="emit('remove', item.id!)"
              title="Eliminar entrada"
              class="cursor-pointer rounded p-1 text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
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

          <div class="mt-1 truncate font-mono text-xs text-ink-2">
            {{ item.url }}
          </div>

          <div class="mt-1 flex items-center gap-1.5">
            <span
              v-if="item.responseStatus !== undefined"
              class="h-1.5 w-1.5 rounded-full"
              :class="statusDot(item.responseStatus)"
            ></span>
            <span
              v-if="item.responseStatus !== undefined"
              class="font-mono text-[10px] font-medium"
              :class="statusColor(item.responseStatus)"
            >
              {{ statusText(item.responseStatus) }}
            </span>
          </div>
        </div>
      </template>

      <template v-else>
        <p
          v-if="props.collections.length === 0"
          class="px-4 py-8 text-center text-xs text-ink-3"
        >
          Guarda peticiones reutilizables con el botón
          <span class="text-ink-2">★</span> de la barra superior.
        </p>

        <div
          v-for="c in props.collections"
          :key="c.id"
          @click="emit('select-collection', c)"
          @dblclick="startRename(c)"
          class="group relative cursor-pointer px-4 py-2.5 transition hover:bg-surface-2/60"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-12 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[10px] font-semibold"
              :class="METHOD_BADGE[c.method]"
            >
              {{ c.method }}
            </span>
            <input
              v-if="editingId === c.id"
              v-model="editingName"
              @click.stop
              @keydown.enter="commitRename"
              @keydown.esc="editingId = null"
              @blur="commitRename"
              type="text"
              spellcheck="false"
              class="w-full bg-transparent text-xs font-medium text-ink outline-none"
            />
            <span v-else class="min-w-0 flex-1 truncate text-xs font-medium text-ink">
              {{ c.name }}
            </span>
            <button
              @click.stop="emit('remove-collection', c.id!)"
              title="Eliminar colección"
              class="cursor-pointer rounded p-1 text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
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

          <div class="mt-1 truncate font-mono text-xs text-ink-2">
            {{ c.url }}
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
