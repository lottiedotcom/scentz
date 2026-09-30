import { put } from '@vercel/blob';
import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export default async function handler(request, response) {
    // 1. Check if this is a bulk import from the backup file
    if (request.body.importData) {
        const importedScents = request.body.importData;
        await client.set('scents', JSON.stringify(importedScents));
        return response.status(200).json({ success: true, message: 'Database restored' });
    }

    // 2. Otherwise, handle standard single image uploads
    const { name, imageBase64 } = request.body;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = await put(`scent-${Date.now()}.jpg`, buffer, { access: 'public' });

    let scents = JSON.parse(await client.get('scents') || '[]');
    scents.push({ id: Date.now(), name, image: blob.url });
    await client.set('scents', JSON.stringify(scents));

    return response.status(200).json({ success: true });
}
