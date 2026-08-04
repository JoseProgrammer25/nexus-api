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
}>();
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
      </div>

      <button
        @click="emit('send')"
        :disabled="props.loading"
        title="Enviar (Cmd/Ctrl + Enter)"
        class="m-1.5 flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-accent-strong px-3 text-[13px] font-medium text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          v-if="props.loading"
          class="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
          />
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
        <span>{{ props.loading ? "Enviando" : "Enviar" }}</span>
      </button>
    </div>
  </div>
</template>
