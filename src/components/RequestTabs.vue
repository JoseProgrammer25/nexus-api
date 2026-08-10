<script setup lang="ts">
import { nextTick, ref } from "vue";
import type { RequestTab } from "../types";
import { METHOD_DOT } from "../utils/format";

const props = defineProps<{
  tabs: RequestTab[];
  activeId?: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  close: [id: string];
  add: [];
  rename: [id: string, name: string];
}>();

const editingId = ref<string | null>(null);
const editingName = ref("");

async function startRename(tab: RequestTab) {
  editingId.value = tab.id;
  editingName.value = tab.name;
  await nextTick();
}

function commitRename() {
  if (editingId.value !== null) {
    emit("rename", editingId.value, editingName.value.trim() || "Petición");
  }
  editingId.value = null;
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-1 border-b border-edge bg-surface px-2 pt-2"
  >
    <div class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-2">
      <div
        v-for="tab in props.tabs"
        :key="tab.id"
        @click="emit('select', tab.id)"
        @dblclick="startRename(tab)"
        class="group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition"
        :class="tab.id === props.activeId ? 'border-accent/40 bg-surface-2 text-ink' : 'border-transparent text-ink-3 hover:bg-surface-2/60 hover:text-ink-2'"
      >
        <span
          class="h-1.5 w-1.5 shrink-0 rounded-full"
          :class="METHOD_DOT[tab.method]"
        ></span>

        <input
          v-if="editingId === tab.id"
          v-model="editingName"
          @click.stop
          @keydown.enter="commitRename"
          @keydown.esc="editingId = null"
          @blur="commitRename"
          type="text"
          spellcheck="false"
          class="w-36 bg-transparent font-medium text-ink outline-none"
        />
        <span v-else class="max-w-40 truncate font-medium" :title="tab.url">
          {{ tab.name }}
        </span>

        <button
          @click.stop="emit('close', tab.id)"
          title="Cerrar pestaña (Cmd/Ctrl+W)"
          class="rounded p-0.5 text-ink-3 transition hover:bg-rose-500/10 hover:text-rose-400"
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

    <button
      @click="emit('add')"
      title="Nueva pestaña (Cmd/Ctrl+N)"
      class="mb-2 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-3 transition hover:bg-surface-2 hover:text-accent"
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
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>
  </div>
</template>
