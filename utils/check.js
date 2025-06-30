import { useCookie } from '#app';
import { post } from '~/composables/post.js';

export async function check() {
    const hash = useCookie('hash');

    if (!hash.value) {
        return { isLoggedIn: false, user: null };
    }

    try {
        const response = await post('login', { hash: hash.value });

        if (response.user?.hash) {
            hash.value = response.user.hash; // به‌روزرسانی کوکی
            return { isLoggedIn: true, user: response.user };
        }

        return { isLoggedIn: false, user: null };
    } catch (error) {
        return { isLoggedIn: false, user: null };
    }
}