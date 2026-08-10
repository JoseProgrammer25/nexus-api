<script setup lang="ts">
import type { KeyValue } from "../types";
import { newKeyValue } from "../utils/format";

const props = defineProps<{
  rows: KeyValue[];
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}>();

const emit = defineEmits<{
  "update:rows": [value: KeyValue[]];
}>();

function updateRow(index: number, patch: Partial<KeyValue>) {
  emit(
    "update:rows",
    props.rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
  );
}

function removeRow(index: number) {
  emit(
    "update:rows",
    props.rows.filter((_, i) => i !== index),
  );
}

function addRow() {
  emit("update:rows", [...props.rows, newKeyValue()]);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="min-h-0 flex-1 overflow-y-auto">
      <table class="w-full text-left">
        <thead
          class="sticky top-0 z-10 border-b border-edge bg-base text-[11px] uppercase tracking-wider text-ink-3"
        >
          <tr>
            <th class="w-10 px-4 py-2 font-medium"></th>
            <th class="w-1/2 px-2 py-2 font-medium">Clave</th>
            <th class="px-2 py-2 font-medium">Valor</th>
            <th class="w-14 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-edge/60">
          <tr
            v-for="(row, i) in props.rows"
            :key="row.uid"
            class="group transition hover:bg-surface-2/50"
            :class="{ 'opacity-40': !row.active }"
          >
            <td class="px-4 py-1.5 text-center align-middle">
              <input
                type="checkbox"
                :checked="row.active"
                @change="updateRow(i, { active: ($event.target as HTMLInputElement).checked })"
                title="Habilitar / deshabilitar"
                class="h-3.5 w-3.5 cursor-pointer accent-accent-strong"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <input
                :value="row.key"
                @input="updateRow(i, { key: ($event.target as HTMLInputElement).value })"
                :placeholder="keyPlaceholder"
                spellcheck="false"
                class="w-full rounded-md bg-transparent px-2 py-1.5 font-mono text-xs text-ink placeholder-ink-3 outline-none transition hover:bg-surface-2/70 focus:bg-surface-2 focus:ring-1 focus:ring-accent/40"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <input
                :value="row.value"
                @input="updateRow(i, { value: ($event.target as HTMLInputElement).value })"
                :placeholder="valuePlaceholder"
                spellcheck="false"
                class="w-full rounded-md bg-transparent px-2 py-1.5 font-mono text-xs text-ink placeholder-ink-3 outline-none transition hover:bg-surface-2/70 focus:bg-surface-2 focus:ring-1 focus:ring-accent/40"
              />
            </td>
            <td class="px-3 py-1.5 text-center align-middle">
              <button
                @click="removeRow(i)"
                title="Eliminar fila"
                class="cursor-pointer rounded-md p-1 text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="shrink-0 border-t border-edge px-4 py-2.5">
      <button
        @click="addRow"
        class="flex cursor-pointer items-center gap-1.5 text-[13px] text-ink-3 transition hover:text-accent"
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
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {{ addLabel ?? "Agregar fila" }}
      </button>
    </div>
  </div>
</template>
