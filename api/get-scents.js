import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export default async function handler(request, response) {
    const scents = await client.get('scents');
    return response.status(200).json(scents ? JSON.parse(scents) : []);
}
