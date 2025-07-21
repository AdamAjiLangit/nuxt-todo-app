<template>
    <VAppBar color="primary" class="" dark>
        <VAppBarTitle>Todo List</VAppBarTitle>
        <VSpacer />

        <VMenu>
            <template #activator="{ props }">
                <VBtn v-bind="props" variant="text" class="d-flex align-center">
                    <VAvatar size="32" class="mr-2">
                        <img src="https://i.pravatar.cc/300" alt="Avatar" />
                    </VAvatar>
                    <span>{{ user?.fullName || 'User' }}</span>
                    <VIcon class="ml-1">mdi-menu-down</VIcon>
                </VBtn>
            </template>

            <VList>
                <VListItem @click="logout">
                    <VListItemTitle>Logout</VListItemTitle>
                </VListItem>
            </VList>
        </VMenu>
    </VAppBar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();

onMounted(() => {
    const userData = Cookies.get('user');
    if (userData) {
        user.value = JSON.parse(userData);
    }
});

const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
};
</script>
