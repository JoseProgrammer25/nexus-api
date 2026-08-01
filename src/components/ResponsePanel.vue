<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatBytes, prettyPrint, statusColor, statusText } from "../utils/format";

const props = defineProps<{
  status?: number;
  time?: number;
  body?: string;
  headers?: Record<string, string>;
}>();

const view = ref<"body" | "headers">("body");

const formattedBody = computed(() => prettyPrint(props.body ?? ""));
const headerEntries = computed(() => Object.entries(props.headers ?? {}));

watch(
  () => props.status,
  () => {
    view.value = "body";
  },
);
</script>

<template>
  <section
    class="flex h-80 shrink-0 flex-col border-t border-[#1b2340] bg-[#0d1322]"
  >
    <div class="flex shrink-0 items-center gap-3 px-4 py-2.5">
      <span
        v-if="props.status !== undefined"
        class="rounded-md border px-2.5 py-0.5 text-xs font-semibold"
        :class="statusColor(props.status)"
      >
        {{ statusText(props.status) }}
      </span>
      <span
        v-if="props.time !== undefined"
        class="text-xs tabular-nums text-slate-500"
      >
        {{ props.time }} ms
      </span>
      <span v-if="props.body" class="text-xs tabular-nums text-slate-500">
        · {{ formatBytes(props.body.length) }}
      </span>

      <div
        class="ml-auto flex items-center gap-1 rounded-lg border border-[#232c4d] p-0.5"
      >
        <button
          @click="view = 'body'"
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          :class="
            view === 'body'
              ? 'bg-[#1b2340] text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          "
        >
          Body
        </button>
        <button
          @click="view = 'headers'"
          class="rounded-md px-3 py-1 text-xs font-medium transition"
          :class="
            view === 'headers'
              ? 'bg-[#1b2340] text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          "
        >
          Headers
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto px-4 pb-4">
      <pre
        v-if="view === 'body' && props.body"
        class="whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-300/90"
        >{{ formattedBody }}</pre
      >

      <table
        v-else-if="view === 'headers' && headerEntries.length > 0"
        class="w-full text-left text-xs"
      >
        <tbody class="divide-y divide-[#1b2340]">
          <tr v-for="[name, value] in headerEntries" :key="name">
            <td class="w-2/5 py-1.5 pr-4 font-semibold text-cyan-300/80">
              {{ name }}
            </td>
            <td class="py-1.5 font-mono text-slate-300">{{ value }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else class="pt-2 text-sm text-slate-600">
        {{
          view === "body"
            ? "Aún no hay respuesta. Envía una petición para ver el resultado."
            : "Esta respuesta no tiene cabeceras."
        }}
      </p>
    </div>
  </section>
</template>
