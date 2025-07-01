import { useFetch } from '#app';

export const useChat = () => {
    const sendMessage = async (receiver, text) => {
        const { data, error } = await useFetch('/api/send', {
            method: 'POST',
            body: { receiver, text }
        });

        return { data, error };
    };

    const editMessage = async (id, text) => {
        const { data, error } = await useFetch('/api/edit', {
            method: 'POST',
            body: { id, text }
        });

        return { data, error };
    };

    const loadMessages = async (receiver) => {
        const { data, error } = await useFetch('/api/chats', {
            method: 'POST',
            body: { receiver }
        });

        return { data, error };
    };

    const checkNewMessages = async (receiver) => {
        const { data, error } = await useFetch('/api/load', {
            method: 'POST',
            body: { receiver }
        });

        return { data, error };
    };

    const createNewChat = async (username) => {
        const { data, error } = await useFetch('/api/CreateChat', {
            method: 'POST',
            body: { username }
        });

        return { data, error };
    };

    return {
        sendMessage,
        editMessage,
        loadMessages,
        checkNewMessages,
        createNewChat
    };
};