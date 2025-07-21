<template>
  <VContainer fluid class="fill-height">
    <VRow no-gutters align="center" justify="center" class="fill-height">
      <VCol cols="12" md="6" lg="5" sm="6">
        <VRow no-gutters align="center" justify="center">
          <VCol cols="12" md="6">
            <h1>Sign In</h1>
            <p class="text-medium-emphasis">Enter your details to get started</p>

            <VForm @submit.prevent="submit" class="mt-7">
              <div class="mt-1">
                <label class="label text-grey-darken-2" for="email">Email</label>
                <VTextField :rules="[ruleRequired, ruleEmail]" v-model="email"
                  prepend-inner-icon="fluent:mail-24-regular" id="email" name="email" type="email" />
              </div>
              <div class="mt-1">
                <label class="label text-grey-darken-2" for="password">Password</label>
                <VTextField :rules="[ruleRequired, rulePassLen]" v-model="password"
                  prepend-inner-icon="fluent:password-20-regular" id="password" name="password" type="password" />
              </div>
              <div class="mt-5">
                <VBtn :loading="loading" type="submit" block min-height="44" class="gradient primary">
                  Sign In
                </VBtn>
              </div>
              <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top center" timeout="2000">
                {{ snackbar.message }}
              </VSnackbar>
            </VForm>
            <p class="text-body-2 mt-10">
              <NuxtLink to="/reset-password" class="font-weight-bold text-primary">Forgot password?</NuxtLink>
            </p>
            <p class="text-body-2 mt-4">
              <span>Don't have an account?
                <NuxtLink to="/signup" class="font-weight-bold text-primary">Sign Up</NuxtLink>
              </span>
            </p>
          </VCol>
        </VRow>
      </VCol>
      <VCol class="hidden-md-and-down fill-height" md="6" lg="7">
        <VImg src="https://wallpaper.dog/large/5557744.jpg" cover
          class="h-100 rounded-xl d-flex align-center justify-center">
          <div class="text-center w-50 text-white mx-auto">
            <h2 class="mb-4">Start your journey today</h2>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores, inventore quia.
              Dolorum dolores ad ipsum voluptatum rem, hic placeat, odio, odit numquam quod
              veritatis accusantium assumenda! Sequi, provident in! Iure!
            </p>
          </div>
        </VImg>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';

definePageMeta({
  layout: 'default',
  hideNavbar: true
});

const email = ref('');
const password = ref('');
const loading = ref(false);

const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();
const router = useRouter();

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const showSnackbar = (message: string, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const submit = async () => {
  loading.value = true;

  try {
    const response = await $fetch('https://fe-test-api.nwappservice.com/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    });

    const token = response.content.token;
    const user = response.content.user;

    Cookies.set('token', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    showSnackbar('Login Successful!', 'success');
    setTimeout(() => {
      router.push('/todo');
    }, 1000);

  } catch (error: any) {
    showSnackbar(error?.data?.message || 'Login failed.', 'error');
  } finally {
    loading.value = false;
  }
};

</script>
