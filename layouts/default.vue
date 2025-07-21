<script setup>
import { useRoute } from 'vue-router';
import NavbarComponent from '../components/navbar.vue';

const route = useRoute();
</script>

<template>
	<VApp>
		<NavbarComponent v-if="!route.meta.hideNavbar" />
		<slot />
	</VApp>
</template>
