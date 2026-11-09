import {useCookie} from "#app";

/**
 * دریافت مقدار یک کوکی خاص
 */
// utils/cookies.ts
export function getCookie(name: string): string | null {
    // اگر در سمت سرور هستیم، از process.server استفاده می‌کنیم
    if (process.server) return null;

    // در سمت کلاینت کوکی را می‌خوانیم
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
}

/**
 * تنظیم یک کوکی جدید
 */
export function setCookie(name: string, value: string, days: number = 30): void {
    if (process.client) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    }
}

/**
 * حذف یک کوکی
 */
export function deleteCookie(name: string): void {
    if (process.client) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
}


/**
 * ارسال درخواست POST
 */
export async function post(url: string, data: any): Promise<any> {
    // let envurl = `http://localhost:8000/api/${url}`
    // let envurl = `https://api.natilos.ir/chat/api/${url}`
    let envurl = `https://chat.xcodestudio.ir/api/${url}`
    const response = await fetch(envurl, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + useCookie('token').value,
        },
        body: JSON.stringify(data),
        mode: 'cors',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw {
            status: response.status,
            data: errorData,
        };
    }

    return await response.json();
}

/**
 * ارسال درخواست GET
 */
export async function get(url: string, params?: Record<string, string>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    const response = await fetch(`http://localhost/${url}${queryString}`, {
        method: 'GET',
        credentials: 'include',
    });

    return await response.json();
}