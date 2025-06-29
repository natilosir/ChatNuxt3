export default async function Post(url: string, data: any): Promise<any> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const response = await fetch('http://localhost/' + url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return await response.json();

}