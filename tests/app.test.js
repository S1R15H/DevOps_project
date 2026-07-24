import request from 'supertest';
import app from '#src/app';

describe ('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        })
    });
    describe('GET /api', () => {
        it('should return API message', async () => {
            const response = await request(app).get('/api');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'API is running');
            
        })
    });
    describe('GET /nonexistent', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/nonexistent');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Not Found');
            
        })
    });
})