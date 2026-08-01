<script setup lang="ts">
import type { KeyValue } from "../types";

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
  emit("update:rows", [...props.rows, { key: "", value: "", active: true }]);
}
</script>

<template>
  <div class="h-full p-4">
    <div class="overflow-hidden rounded-lg border border-[#232c4d]">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#131a2e] text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="w-12 px-3 py-2"></th>
            <th class="px-3 py-2 font-medium">Clave</th>
            <th class="px-3 py-2 font-medium">Valor</th>
            <th class="w-14 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#1b2340]">
          <tr v-for="(row, i) in props.rows" :key="i">
            <td class="px-3 py-2 text-center">
              <input
                type="checkbox"
                :checked="row.active"
                @change="updateRow(i, { active: ($event.target as HTMLInputElement).checked })"
                title="Habilitar / deshabilitar"
                class="h-4 w-4 cursor-pointer accent-emerald-500"
              />
            </td>
            <td class="px-3 py-2">
              <input
                :value="row.key"
                @input="updateRow(i, { key: ($event.target as HTMLInputElement).value })"
                :placeholder="keyPlaceholder"
                spellcheck="false"
                class="w-full rounded-md border border-[#232c4d] bg-[#0d1322] px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-[#3b82f6]"
              />
            </td>
            <td class="px-3 py-2">
              <input
                :value="row.value"
                @input="updateRow(i, { value: ($event.target as HTMLInputElement).value })"
                :placeholder="valuePlaceholder"
                spellcheck="false"
                class="w-full rounded-md border border-[#232c4d] bg-[#0d1322] px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-[#3b82f6]"
              />
            </td>
            <td class="px-3 py-2 text-center">
              <button
                @click="removeRow(i)"
                title="Eliminar fila"
                class="rounded-md p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
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

    <button
      @click="addRow"
      class="mt-3 rounded-lg border border-dashed border-[#2a3351] px-4 py-2 text-sm text-slate-400 transition hover:border-[#3b82f6] hover:text-[#3b82f6]"
    >
      {{ addLabel ?? "+ Agregar fila" }}
    </button>
  </div>
</template>
