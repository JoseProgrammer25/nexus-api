<script setup lang="ts">
import type { HttpMethod } from "../types";
import { METHOD_TEXT } from "../utils/format";

const props = defineProps<{
  method: HttpMethod;
  url: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  "update:method": [value: HttpMethod];
  "update:url": [value: string];
  send: [];
}>();

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
</script>

<template>
  <div
    class="flex items-center gap-2 border-b border-[#1b2340] bg-[#0d1322] px-4 py-3"
  >
    <select
      :value="props.method"
      @change="emit('update:method', ($event.target as HTMLSelectElement).value as HttpMethod)"
      :disabled="props.loading"
      class="h-10 cursor-pointer rounded-lg border border-[#232c4d] bg-[#131a2e] px-3 text-sm font-bold outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30 disabled:cursor-not-allowed disabled:opacity-60"
      :class="METHOD_TEXT[props.method]"
    >
      <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
    </select>

    <input
      :value="props.url"
      @input="emit('update:url', ($event.target as HTMLInputElement).value)"
      @keydown.meta.enter="emit('send')"
      @keydown.ctrl.enter="emit('send')"
      type="text"
      placeholder="https://api.ejemplo.com/recurso"
      spellcheck="false"
      autocomplete="off"
      class="h-10 min-w-0 flex-1 rounded-lg border border-[#232c4d] bg-[#131a2e] px-3 font-mono text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30"
    />

    <button
      @click="emit('send')"
      :disabled="props.loading"
      title="Enviar (Cmd/Ctrl + Enter)"
      class="h-10 w-32 shrink-0 rounded-lg text-sm font-semibold text-white shadow-lg transition"
      :class="
        props.loading
          ? 'cursor-not-allowed bg-gradient-to-r from-rose-600 to-orange-600 opacity-60 shadow-rose-900/30'
          : 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-900/40 hover:brightness-110 active:scale-95'
      "
    >
      <span v-if="props.loading" class="flex items-center justify-center gap-2">
        <span
          class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        ></span>
        Enviando
      </span>
      <span v-else>Send</span>
    </button>
  </div>
</template>
