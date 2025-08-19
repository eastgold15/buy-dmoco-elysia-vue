<script setup></script>

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
	<RouterView />
</template>