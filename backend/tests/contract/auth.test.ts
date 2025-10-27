/**
 * Authentication Contract Tests
 * 
 * Tests for /api/auth/* endpoints
 * Constitution: API Testing Required (Principle III)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/server'
import { prisma } from '../../src/models'

describe('POST /api/auth/register', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } })
  })

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test-register@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body.user.email).toBe('test-register@example.com')
  })

  it('should fail if passwords do not match', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test-mismatch@example.com',
        password: 'password123',
        confirmPassword: 'different',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('should fail if email is already registered', async () => {
    const email = 'test-duplicate@example.com'
    
    // Register first time
    await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      confirmPassword: 'password123',
    })

    // Try to register again
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        confirmPassword: 'password123',
      })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DUPLICATE_ENTRY')
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test-login@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } })
  })

  it('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-login@example.com',
        password: 'password123',
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
  })

  it('should fail with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-login@example.com',
        password: 'wrongpassword',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})

describe('GET /api/auth/me', () => {
  let accessToken: string

  beforeAll(async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test-me@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    accessToken = response.body.accessToken
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } })
  })

  it('should return current user profile', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body.user.email).toBe('test-me@example.com')
  })

  it('should fail without authentication token', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_TOKEN')
  })
})

