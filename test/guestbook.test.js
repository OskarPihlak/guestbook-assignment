import axios      from 'axios';
import * as faker from 'faker';

describe('Guest book test', () => {
    const api = axios.create({
        validateStatus: () => true
    });
    const guestbook = createFakeGuests();
    
    guestbook.forEach(entry => {
        describe(`Guest book entry by ${entry.first_name} ${entry.last_name}`, () => {
            it('should create a new guest book entry', async () => {
                const {status, data} = await api.post('http://localhost:3000/guestbook', entry);
                
                expect(status).toBe(201);
                expect(data).toHaveProperty('data');
                expect(data).toHaveProperty('data.id');
                expect(data).toHaveProperty('data.created_at');
                
                expect(typeof data.data.id).toBe('number');
                expect(typeof data.data.created_at).toBe('string');
                
                entry.id = data.data.id;
                entry.created_at = data.data.created_at;
            });
            
            it('should get the single guest book entry', async () => {
                const {status, data} = await api.get(`http://localhost:3000/guestbook/${entry.id}`);
                
                expect(status).toBe(200);
                
                expect(data).toHaveProperty('data');
                expect(data).toHaveProperty('data.id', entry.id);
                expect(data).toHaveProperty('data.first_name', entry.first_name);
                expect(data).toHaveProperty('data.last_name', entry.last_name);
                expect(data).toHaveProperty('data.message', entry.message);
                expect(data).toHaveProperty('data.created_at', entry.created_at);
                
                expect(typeof data.data).toBe('object');
                expect(typeof data.data.id).toBe('number');
                expect(typeof data.data.first_name).toBe('string');
                expect(typeof data.data.last_name).toBe('string');
                expect(typeof data.data.message).toBe('string');
                expect(typeof data.data.created_at).toBe('string');
            });
            
        });
    });
    
    describe('The whole guest book', () => {
        it('should list all the entries', async () => {
            const {status, data} = await api.get('http://localhost:3000/guestbook');
            
            expect(status).toBe(200);
            expect(data).toHaveProperty('data');
            expect(Array.isArray(data.data)).toBe(true);
            
            data.data.forEach(entry => {
                expect(typeof entry).toBe('object');
                expect(typeof entry.id).toBe('number');
                expect(typeof entry.first_name).toBe('string');
                expect(typeof entry.last_name).toBe('string');
                expect(typeof entry.message).toBe('string');
                expect(typeof entry.created_at).toBe('string');
            });
        });
        
        it('should contain the created entries', async () => {
            const {status, data} = await api.get('http://localhost:3000/guestbook');
            
            expect(status).toBe(200);
            expect(data).toHaveProperty('data');
            expect(Array.isArray(data.data)).toBe(true);
            
            guestbook.forEach(entry => {
                const remote = data.data.find(e => e.id === entry.id) || null;
                
                expect(remote).not.toBeNull();
                expect(remote).toHaveProperty('id', entry.id);
                expect(remote).toHaveProperty('first_name', entry.first_name);
                expect(remote).toHaveProperty('last_name', entry.last_name);
                expect(remote).toHaveProperty('message', entry.message);
                expect(remote).toHaveProperty('created_at', entry.created_at);
            });
        });
    });
    
    describe('Deleting guest book entries', () => {
        guestbook.forEach(entry => {
            describe(`${entry.first_name} ${entry.last_name}`, () => {
                it(`should delete entry`, async () => {
                    const {status, data} = await api.delete(`http://localhost:3000/guestbook/${entry.id}`);
                    
                    expect(status).toBe(200);
                    expect(data).toHaveProperty('data');
                    expect(data).toHaveProperty('data.id');
                    expect(data).toHaveProperty('data.deleted_at');
                });
                
                it('should not find the single guest book entry', async () => {
                    const {status, data} = await api.get(`http://localhost:3000/guestbook/${entry.id}`);
                    
                    expect(status).toBe(404);
                    expect(data).toHaveProperty('message', 'Entry not found');
                });
            });
        });
        
        it('should not find the entries in the guest book', async () => {
            const {status, data} = await api.get('http://localhost:3000/guestbook');
            
            expect(status).toBe(200);
            expect(data).toHaveProperty('data');
            expect(Array.isArray(data.data)).toBe(true);
            
            guestbook.forEach(entry => {
                const remote = data.data.find(e => e.id === entry.id) || null;
                
                expect(remote).toBeNull();
            });
        });
    });
});

function createFakeGuests() {
    const array = [];
    for (let i = 0; i < 10; i++) {
        array.push({
            first_name: faker.name.firstName(),
            last_name : faker.name.lastName(),
            message   : faker.lorem.text()
        });
    }
    return array;
}
