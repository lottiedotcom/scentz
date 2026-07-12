import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

    try {
        const { id, name, imageBase64, isNewImage } = request.body;
        
        let scents = await kv.get('scents') || [];
        const scentIndex = scents.findIndex(s => s.id === id);
        
        if (scentIndex === -1) return response.status(404).json({error: "Scent not found"});

        let finalImageUrl = scents[scentIndex].image;

        // If you uploaded a replacement photo, save it to Blob first
        if (isNewImage) {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `scent-edit-${Date.now()}.jpg`;
            const blob = await put(filename, buffer, { access: 'public', contentType: 'image/jpeg' });
            finalImageUrl = blob.url;
        }

        // Update the database with the new name and (potentially) new image URL
        scents[scentIndex].name = name;
        scents[scentIndex].image = finalImageUrl;
        await kv.set('scents', scents);

        return response.status(200).json({ success: true });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}

