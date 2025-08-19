<script setup>
import Counter from '@/app/components/count.vue'
import { ofetch } from "ofetch";

const data = await ofetch("/api");
console.log("1111",data)
</script>

<template>
	<Counter />
	{{ data }}

	<div>
		{{ data }}
	</div>
</template>