export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie('token').value;

    const publicPages = ['/', '/signup'];

    if (!token && !publicPages.includes(to.path)) {
        return navigateTo('/');
    }
});
