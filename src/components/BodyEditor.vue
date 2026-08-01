<script setup lang="ts">
import { computed } from "vue";
import { prettyPrint } from "../utils/format";

const props = defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  "update:text": [value: string];
}>();

const jsonState = computed<"valid" | "invalid" | "none">(() => {
  const trimmed = props.text.trim();
  if (!trimmed) return "none";
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return "none";
  try {
    JSON.parse(trimmed);
    return "valid";
  } catch {
    return "invalid";
  }
});

function formatJson() {
  try {
    emit("update:text", prettyPrint(props.text));
  } catch {
    // texto no JSON: se deja tal cual
  }
}
</script>

<template>
  <div class="flex h-full flex-col gap-2">
    <div class="flex shrink-0 items-center gap-2">
      <span
        v-if="jsonState === 'valid'"
        class="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        JSON válido
      </span>
      <span
        v-else-if="jsonState === 'invalid'"
        class="flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-medium text-rose-400"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
        JSON inválido
      </span>
      <span
        v-else
        class="text-[10px] uppercase tracking-wide text-slate-600"
      >
        Texto / JSON
      </span>

      <button
        @click="formatJson"
        class="ml-auto rounded-md border border-[#2a3351] px-2.5 py-1 text-[10px] font-medium text-slate-400 transition hover:border-[#3b82f6] hover:text-[#3b82f6]"
      >
        Formatear JSON
      </button>
    </div>

    <textarea
      :value="props.text"
      @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
      placeholder='{\n  "clave": "valor"\n}'
      spellcheck="false"
      class="h-full min-h-0 w-full resize-none rounded-lg border border-[#232c4d] bg-[#0d1322] p-3 font-mono text-xs leading-relaxed text-slate-200 placeholder-slate-600 outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30"
    ></textarea>
  </div>
</template>
