import { put } from '@vercel/blob';
import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export default async function handler(request, response) {
    const { name, imageBase64 } = request.body;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = await put(`scent-${Date.now()}.jpg`, buffer, { access: 'public' });

    let scents = JSON.parse(await client.get('scents') || '[]');
    scents.push({ id: Date.now(), name, image: blob.url });
    await client.set('scents', JSON.stringify(scents));

    return response.status(200).json({ success: true });
}
