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
  <div class="flex h-full min-h-0 flex-col p-4">
    <div class="mb-2 flex shrink-0 items-center gap-2 px-1">
      <span class="flex items-center gap-1.5 text-xs">
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="
            jsonState === 'valid'
              ? 'bg-emerald-400'
              : jsonState === 'invalid'
                ? 'bg-rose-400'
                : 'bg-ink-3'
          "
        ></span>
        <span
          class="font-medium"
          :class="
            jsonState === 'valid'
              ? 'text-emerald-400'
              : jsonState === 'invalid'
                ? 'text-rose-400'
                : 'text-ink-3'
          "
        >
          {{
            jsonState === "valid"
              ? "JSON válido"
              : jsonState === "invalid"
                ? "JSON inválido"
                : "Texto / JSON"
          }}
        </span>
      </span>

      <button
        @click="formatJson"
        class="ml-auto cursor-pointer rounded-md px-2 py-1 text-xs text-ink-3 transition hover:bg-surface-2 hover:text-accent"
      >
        Formatear JSON
      </button>
    </div>

    <div
      class="min-h-0 flex-1 overflow-hidden rounded-lg border border-edge bg-surface-2 transition focus-within:border-accent-strong/60 focus-within:ring-2 focus-within:ring-accent/20"
    >
      <textarea
        :value="props.text"
        @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
        placeholder='{\n  "clave": "valor"\n}'
        spellcheck="false"
        class="h-full w-full resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-ink placeholder-ink-3 outline-none"
      ></textarea>
    </div>
  </div>
</template>
