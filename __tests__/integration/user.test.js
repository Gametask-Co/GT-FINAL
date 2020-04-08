import request from 'supertest';
import app from '../../src/app';

describe('User', () => {
    it('should receive Validation error', async () => {
        const response = await request(app)
            .post('/user/')
            .send({
                name: 'test gametask'
            });

        expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive invalid birthday', async () => {
        const response = await request(app)
            .post('/user/')
            .send({
                name: 'test gametask',
                email: 'gametask@gametask.com',
                birthday: '12/29/2050',
                password: 'test123'
            });

        expect(response.body).toEqual({ message: 'Invalid birthday' });
    });

    it('should create user', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'test gametask',
                email: 'gametask@gametask.com',
                birthday: '10/11/1995',
                password: 'test123'
            });

        expect(response.body).toHaveProperty('token');
    });

    it('should authenticate as user', async () => {
        const response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test123'
            });

        expect(response.body).toHaveProperty('token');
    });

    it('should receive User already exists!', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'test gametask',
                email: 'gametask@gametask.com',
                birthday: '10/11/1995',
                password: 'test123'
            });

        expect(response.body).toEqual({ message: 'User already exists!' });
    });

    it('should receive information about user', async () => {
        const auth_response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test123'
            });

        const { token } = auth_response.body;

        const response = await request(app)
            .get('/user/')
            .set('Authorization', 'Bearer ' + token);

        expect(response.body).toHaveProperty('user');
    });

    it('should receive user not found or invalid password', async () => {
        const response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test12333333'
            });

        expect(response.body).toEqual({
            message: 'User not found or Invalid password'
        });
    });

    it('should receive validation error', async () => {
        const response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com'
            });

        expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive email already taken', async () => {
        await request(app)
            .post('/user')
            .send({
                name: 'test gametask',
                email: 'newgametask@gametask.com',
                birthday: '10/11/1995',
                password: 'test123'
            });

        const auth_response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test123'
            });

        const { token } = auth_response.body;

        const response = await request(app)
            .put('/user')
            .set('Authorization', 'Bearer ' + token)
            .send({
                email: 'newgametask@gametask.com'
            });

        expect(response.body).toEqual({ message: 'Email already taken' });
    });

    it('should receive password does not match', async () => {
        const auth_response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test123'
            });

        const { token } = auth_response.body;

        const response = await request(app)
            .put('/user')
            .set('Authorization', 'Bearer ' + token)
            .send({
                oldPassword: 'notsamepassword'
            });

        expect(response.body).toEqual({ message: 'Password does not match' });
    });

    it('should receive updated info', async () => {
        const auth_response = await request(app)
            .post('/user/auth')
            .send({
                email: 'gametask@gametask.com',
                password: 'test123'
            });

        const { token } = auth_response.body;

        const { p_name, p_email } = await request(app)
            .get('/user/')
            .set('Authorization', 'Bearer ' + token);

        const new_info = {
            name: 'New name',
            email: 'newemail@gametask.com'
        };

        await request(app)
            .put('/user')
            .set('Authorization', 'Bearer ' + token)
            .send(new_info);

        const response = await request(app)
            .get('/user/')
            .set('Authorization', 'Bearer ' + token);

        const { name, email } = response.body.user;
        expect({ name, email }).not.toEqual(p_name, p_email);
        expect({ name, email }).toEqual(new_info);
    });

    let old_token;

    it('should delete user from database', async () => {
        const auth_response = await request(app)
            .post('/user/auth')
            .send({
                email: 'newgametask@gametask.com',
                password: 'test123'
            });

        const { token } = auth_response.body;
        old_token = token;

        const response = await request(app)
            .delete('/user/')
            .set('Authorization', 'Bearer ' + token);

        expect(response.body).toEqual({ message: 'Delete successfully' });
    });

    it('should receive user not found because user is already deleted', async () => {
        const response = await request(app)
            .delete('/user/')
            .set('Authorization', 'Bearer ' + old_token);

        expect(response.body).toEqual({ message: 'User not found' });
    });
});
