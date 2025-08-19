<script setup>
import Button from 'primevue/button';

</script>

<template>
	<h1>Vue + Elysia</h1>
	<nav>
		<ul>
			<li class="red">
				<RouterLink to="/" class="--g-main-area-bg">Home</RouterLink>
			</li>
			<li>
				<RouterLink to="/counter">Counter</RouterLink>
			</li>
		</ul>
	</nav>
	<Button label="Submit" />
	<RouterView></RouterView>
	<!-- 使用Suspense包装RouterView以支持异步组件 -->
	<!-- <Suspense>
		<template #default>
			<RouterView />
		</template>
		<template #fallback>
			<div>Loading...</div>
		</template>
	</Suspense> -->
</template>