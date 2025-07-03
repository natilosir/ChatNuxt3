// import {post, getCookie} from '~/composables/post.js';
//
// export const useAuthCheck = async () => {
//     const hash = getCookie('hash');
//
//     if (!hash) {
//         return {isLoggedIn: false, user: null};
//     }
//
//     try {
//         const response = await post('login', {hash});
//
//         if (response.user.hash) {
//             setCookie('token', response.token, 365);
//             setCookie('hash', response.user.hash, 365)
//             return {isLoggedIn: true, user: response.user};
//         }
//
//         return {isLoggedIn: false, user: null};
//     } catch (error) {
//         return {isLoggedIn: false, user: null};
//     }
// };