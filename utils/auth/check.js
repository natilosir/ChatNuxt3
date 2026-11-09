import { useCookie } from '#app';
import { post, setCookie } from '~/composables/api/post.ts';

export async function check() {
    const token = useCookie('token');

    if (!token.value) {
        return { isLoggedIn: false, user: null };
    }

    try {
        const response = await post('check');

        if (response.user?.hash) {
            setCookie('hash', response.user.hash, 365);
            return { isLoggedIn: true, user: response.user };
        }

        return { isLoggedIn: false, user: null };
    } catch (error) {
        return { isLoggedIn: false, user: null };
    }
}