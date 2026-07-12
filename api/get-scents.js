import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    try {
        // Fetches your entire library from the cloud
        const scents = await kv.get('scents') || [];
        return response.status(200).json(scents);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
