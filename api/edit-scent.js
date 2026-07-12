import { put } from '@vercel/blob';
import { createClient } from 'redis';

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    try {
        const { id, name, imageBase64, isNewImage } = request.body;
        let scents = JSON.parse(await client.get('scents') || '[]');
        const scentIndex = scents.findIndex(s => s.id === id);
        
        if (scentIndex === -1) {
            await client.disconnect();
            return response.status(404).json({error: "Scent not found"});
        }

        let finalImageUrl = scents[scentIndex].image;

        if (isNewImage) {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = await put(`scent-edit-${Date.now()}.jpg`, buffer, { access: 'public' });
            finalImageUrl = blob.url;
        }

        scents[scentIndex].name = name;
        scents[scentIndex].image = finalImageUrl;
        await client.set('scents', JSON.stringify(scents));
        
        await client.disconnect();
        return response.status(200).json({ success: true });
    } catch (error) {
        await client.disconnect();
        return response.status(500).json({ error: error.message });
    }
}
