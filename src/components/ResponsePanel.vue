<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  formatBytes,
  highlightJson,
  statusColor,
  statusDot,
  statusText,
} from "../utils/format";

const props = defineProps<{
  status?: number;
  time?: number;
  body?: string;
  headers?: Record<string, string>;
}>();

const view = ref<"body" | "headers">("body");

const highlightedBody = computed(() => highlightJson(props.body ?? ""));
const headerEntries = computed(() => Object.entries(props.headers ?? {}));

watch(
  () => props.status,
  () => {
    view.value = "body";
  },
);
</script>

<template>
  <section class="flex h-80 shrink-0 flex-col border-t border-edge bg-surface">
    <div class="flex shrink-0 items-center gap-3 border-b border-edge px-4 py-2.5">
      <span v-if="props.status !== undefined" class="flex items-center gap-2">
        <span
          class="h-2 w-2 rounded-full"
          :class="statusDot(props.status)"
        ></span>
        <span
          class="font-mono text-[13px] font-medium"
          :class="statusColor(props.status)"
        >
          {{ statusText(props.status) }}
        </span>
      </span>

      <span v-if="props.time !== undefined" class="text-xs tabular-nums text-ink-3">
        {{ props.time }} ms
      </span>
      <span v-if="props.body" class="text-xs tabular-nums text-ink-3">
        · {{ formatBytes(props.body.length) }}
      </span>

      <div
        v-if="props.status !== undefined || headerEntries.length > 0"
        class="ml-auto flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5"
      >
        <button
          @click="view = 'body'"
          class="cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition"
          :class="
            view === 'body'
              ? 'bg-surface-3 text-ink'
              : 'text-ink-3 hover:text-ink-2'
          "
        >
          Body
        </button>
        <button
          @click="view = 'headers'"
          class="cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition"
          :class="
            view === 'headers'
              ? 'bg-surface-3 text-ink'
              : 'text-ink-3 hover:text-ink-2'
          "
        >
          Headers
        </button>
      </div>
    </div>

    <div class="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-3">
      <pre
        v-if="view === 'body' && props.body"
        class="whitespace-pre-wrap font-mono text-xs leading-relaxed"
        v-html="highlightedBody"
      ></pre>

      <table
        v-else-if="view === 'headers' && headerEntries.length > 0"
        class="w-full text-left text-xs"
      >
        <tbody class="divide-y divide-edge/60">
          <tr v-for="[name, value] in headerEntries" :key="name">
            <td class="w-2/5 py-1.5 pr-4 font-mono text-[12px] font-medium text-sky-300/90">
              {{ name }}
            </td>
            <td class="break-all py-1.5 font-mono text-ink-2">{{ value }}</td>
          </tr>
        </tbody>
      </table>

      <div
        v-else
        class="flex flex-1 items-center justify-center text-center text-sm text-ink-3"
      >
        {{
          view === "body"
            ? "Aún no hay respuesta. Envía una petición para ver el resultado."
            : "Esta respuesta no tiene cabeceras."
        }}
      </div>
    </div>
  </section>
</template>
