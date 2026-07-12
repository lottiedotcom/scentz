import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export default async function handler(request, response) {
    const { id } = request.body;
    let scents = JSON.parse(await client.get('scents') || '[]');
    scents = scents.filter(s => s.id !== id);
    await client.set('scents', JSON.stringify(scents));
    return response.status(200).json({ success: true });
}
