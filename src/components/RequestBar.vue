<script setup lang="ts">
import type { HttpMethod } from "../types";
import { METHOD_DOT, METHOD_TEXT, METHODS } from "../utils/format";

const props = defineProps<{
  method: HttpMethod;
  url: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  "update:method": [value: HttpMethod];
  "update:url": [value: string];
  send: [];
  cancel: [];
  save: [];
}>();

function clearUrl() {
  emit("update:url", "");
}

function onPrimary() {
  if (props.loading) emit("cancel");
  else emit("send");
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-3 border-b border-edge bg-surface px-4 py-3"
  >
    <div
      class="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-edge bg-surface-2 transition focus-within:border-accent-strong/60 focus-within:ring-2 focus-within:ring-accent/20"
    >
      <div class="relative flex h-full shrink-0 items-center">
        <span
          class="pointer-events-none absolute left-3.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          :class="METHOD_DOT[props.method]"
        ></span>
        <select
          :value="props.method"
          :disabled="props.loading"
          @change="emit('update:method', ($event.target as HTMLSelectElement).value as HttpMethod)"
          class="h-full cursor-pointer appearance-none bg-transparent py-0 pl-6 pr-6 font-mono text-[13px] font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="METHOD_TEXT[props.method]"
        >
          <option
            v-for="m in METHODS"
            :key="m"
            :value="m"
            class="bg-surface-2 text-ink"
          >
            {{ m }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute right-2 h-3.5 w-3.5 text-ink-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div class="h-5 w-px shrink-0 bg-edge" aria-hidden="true"></div>

      <div class="flex h-full min-w-0 flex-1 items-center gap-2 px-3">
        <svg
          class="h-3.5 w-3.5 shrink-0 text-ink-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <input
          :value="props.url"
          @input="emit('update:url', ($event.target as HTMLInputElement).value)"
          @keydown.meta.enter="emit('send')"
          @keydown.ctrl.enter="emit('send')"
          type="text"
          placeholder="https://api.ejemplo.com/recurso"
          spellcheck="false"
          autocomplete="off"
          class="h-full w-full min-w-0 bg-transparent font-mono text-[13px] text-ink placeholder-ink-3 outline-none"
        />
        <button
          v-if="props.url"
          @click="clearUrl"
          title="Limpiar URL"
          class="shrink-0 cursor-pointer rounded p-0.5 text-ink-3 transition hover:bg-surface-2 hover:text-ink"
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>

    <button
      @click="emit('save')"
      :disabled="props.loading"
      title="Guardar en colecciones"
      class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-edge bg-surface-2 text-ink-3 transition hover:border-accent-strong/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
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
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </svg>
    </button>

    <button
      @click="onPrimary"
      :title="loading ? 'Cancelar (Esc)' : 'Enviar (Cmd/Ctrl + Enter)'"
      class="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition"
      :class="
        loading
          ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
          : 'bg-accent-strong text-white hover:bg-accent'
      "
    >
      <svg
        v-if="loading"
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14" />
      </svg>
      <svg
        v-else
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
      <span>{{ loading ? "Cancelar" : "Enviar" }}</span>
    </button>
  </div>
</template>
