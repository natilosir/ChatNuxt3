import { useCookie } from '#app';
import { post } from '~/composables/post.js';

export async function check() {
    const token = useCookie('token');

    if (!token.value) {
        return { isLoggedIn: false, user: null };
    }

    try {
        const response = await post('check');

        if (response.user?.hash) {
            setCookie('hash', response.user.hash, 365);
            token.value = response.token;
            return { isLoggedIn: true, user: response.user };
        }

        return { isLoggedIn: false, user: null };
    } catch (error) {
        return { isLoggedIn: false, user: null };
    }
}