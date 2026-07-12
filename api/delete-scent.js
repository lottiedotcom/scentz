import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({error: 'Method not allowed'});

    try {
        const { id } = request.body;
        
        // Pulls the library, filters out the deleted note, and re-saves
        let scents = await kv.get('scents') || [];
        scents = scents.filter(scent => scent.id !== id);
        await kv.set('scents', scents);

        return response.status(200).json({ success: true });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}

