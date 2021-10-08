<template>
  <div class="overflow-hidden shadow rounded-lg bg-gray-900 cursor-pointer">
    <div class="px-4 py-5 sm:p-6 text-center">
      <dt class="text-sm font-medium text-yellow-500 truncate">
        {{ title }}
      </dt>
      <dd class="mt-1 text-3xl font-semibold text-yellow-500">
        {{ price }}
      </dd>
      <slot name="actions"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "PriceCard",

  props: {
    title: {
      required: true,
      type: String
    },
    price: {
      required: true
    }
  }
};
</script>
