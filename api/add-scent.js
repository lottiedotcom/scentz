import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

    try {
        const { name, imageBase64 } = request.body;

        // Convert the image data back into a file buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `scent-${Date.now()}.jpg`;

        // 1. Upload the photo to Vercel Blob
        const blob = await put(filename, buffer, { access: 'public', contentType: 'image/jpeg' });

        // 2. Save the name and the new photo URL to Vercel KV
        const newScent = { id: Date.now(), name: name, image: blob.url };
        let scents = await kv.get('scents') || [];
        scents.push(newScent);
        await kv.set('scents', scents);

        return response.status(200).json(newScent);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}

