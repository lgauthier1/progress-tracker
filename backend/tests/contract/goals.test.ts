/**
 * Goals Contract Tests
 * 
 * Tests for /api/goals/* endpoints
 * Constitution: API Testing Required (Principle III)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../src/server'
import { prisma } from '../../src/models'

let accessToken: string
let userId: string

beforeAll(async () => {
  // Clean up any existing test data
  await prisma.progressEntry.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.user.deleteMany({ where: { email: { contains: 'test-goals' } } })

  // Create test user and get token
  const response = await request(app).post('/api/auth/register').send({
    email: 'test-goals@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  
  expect(response.status).toBe(201)
  expect(response.body).toHaveProperty('accessToken')
  expect(response.body).toHaveProperty('user')
  
  accessToken = response.body.accessToken
  userId = response.body.user.id
  
  console.log(`✅ Test user created: ${userId}`)
})

afterAll(async () => {
  // Clean up test data
  await prisma.progressEntry.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.user.deleteMany({ where: { email: { contains: 'test-goals' } } })
  await prisma.$disconnect()
})

describe('POST /api/goals', () => {
  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should create a target-based goal successfully', async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Save for vacation',
        unit: 'dollars',
        targetValue: 5000,
        deadline: '2025-12-31T00:00:00Z',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('goal')
    expect(response.body.goal.goalType).toBe('TARGET_BASED')
    expect(response.body.goal.title).toBe('Save for vacation')
    expect(response.body.goal.targetValue).toBe(5000)
    expect(response.body.goal.currentValue).toBe(0)
  })

  it('should create a continuous counter goal successfully', async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'CONTINUOUS_COUNTER',
        title: 'Days without alcohol',
        unit: 'days',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('goal')
    expect(response.body.goal.goalType).toBe('CONTINUOUS_COUNTER')
    expect(response.body.goal.title).toBe('Days without alcohol')
    expect(response.body.goal.currentValue).toBe(0)
    expect(response.body.goal).toHaveProperty('startDate')
  })

  it('should fail without authentication', async () => {
    const response = await request(app)
      .post('/api/goals')
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test goal',
        unit: 'units',
        targetValue: 100,
        deadline: '2025-12-31T00:00:00Z',
      })

    expect(response.status).toBe(401)
  })

  it('should fail with invalid data', async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        // Missing required fields
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /api/goals', () => {
  beforeEach(async () => {
    // Create test goals
    await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Goal 1',
        unit: 'units',
        targetValue: 100,
        deadline: '2025-12-31T00:00:00Z',
      })

    await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'CONTINUOUS_COUNTER',
        title: 'Goal 2',
        unit: 'days',
      })
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should return all user goals', async () => {
    const response = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('goals')
    expect(response.body.goals).toBeInstanceOf(Array)
    expect(response.body.goals.length).toBe(2)
  })

  it('should filter goals by status', async () => {
    const response = await request(app)
      .get('/api/goals?status=ACTIVE')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.goals.every((g: any) => g.status === 'ACTIVE')).toBe(true)
  })

  it('should fail without authentication', async () => {
    const response = await request(app).get('/api/goals')

    expect(response.status).toBe(401)
  })
})

describe('GET /api/goals/:id', () => {
  let goalId: string

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test Goal',
        unit: 'units',
        targetValue: 100,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = response.body.goal.id
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should return a specific goal', async () => {
    const response = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('goal')
    expect(response.body.goal.id).toBe(goalId)
  })

  it('should fail for non-existent goal', async () => {
    const response = await request(app)
      .get('/api/goals/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app).get(`/api/goals/${goalId}`)

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/goals/:id', () => {
  let goalId: string

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Original Title',
        unit: 'units',
        targetValue: 100,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = response.body.goal.id
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should update goal successfully', async () => {
    const response = await request(app)
      .patch(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Title',
        targetValue: 200,
      })

    expect(response.status).toBe(200)
    expect(response.body.goal.title).toBe('Updated Title')
    expect(response.body.goal.targetValue).toBe(200)
  })

  it('should fail for non-existent goal', async () => {
    const response = await request(app)
      .patch('/api/goals/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated' })

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app)
      .patch(`/api/goals/${goalId}`)
      .send({ title: 'Updated' })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/goals/:id', () => {
  let goalId: string

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Goal to delete',
        unit: 'units',
        targetValue: 100,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = response.body.goal.id
  })

  it('should delete goal successfully', async () => {
    const response = await request(app)
      .delete(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success')

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(getResponse.status).toBe(404)
  })

  it('should fail for non-existent goal', async () => {
    const response = await request(app)
      .delete('/api/goals/550e8400-e29b-41d4-a716-446655440000')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app).delete(`/api/goals/${goalId}`)

    expect(response.status).toBe(401)
  })
})

describe('POST /api/goals/:id/progress', () => {
  let goalId: string

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test Goal',
        unit: 'dollars',
        targetValue: 1000,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = response.body.goal.id
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should log progress successfully', async () => {
    const response = await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        value: 100,
        note: 'First progress entry',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('entry')
    expect(response.body.entry.value).toBe(100)
    expect(response.body.entry.note).toBe('First progress entry')
  })

  it('should update goal currentValue after logging progress', async () => {
    await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 100 })

    const goalResponse = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(goalResponse.body.goal.currentValue).toBe(100)
  })

  it('should fail for non-existent goal', async () => {
    const response = await request(app)
      .post('/api/goals/550e8400-e29b-41d4-a716-446655440000/progress')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 100 })

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .send({ value: 100 })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/goals/:id/progress', () => {
  let goalId: string

  beforeEach(async () => {
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test Goal',
        unit: 'dollars',
        targetValue: 1000,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = goalResponse.body.goal.id

    // Add progress entries
    await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 100 })

    await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 200 })
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should return all progress entries for a goal', async () => {
    const response = await request(app)
      .get(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('entries')
    expect(response.body.entries).toBeInstanceOf(Array)
    expect(response.body.entries.length).toBe(2)
  })

  it('should fail for non-existent goal', async () => {
    const response = await request(app)
      .get('/api/goals/550e8400-e29b-41d4-a716-446655440000/progress')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app).get(`/api/goals/${goalId}/progress`)

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/goals/:id/progress/:entryId', () => {
  let goalId: string
  let entryId: string

  beforeEach(async () => {
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test Goal',
        unit: 'dollars',
        targetValue: 1000,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = goalResponse.body.goal.id

    const entryResponse = await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 100 })
    entryId = entryResponse.body.entry.id
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should update progress entry successfully', async () => {
    const response = await request(app)
      .patch(`/api/goals/${goalId}/progress/${entryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        value: 150,
        note: 'Updated note',
      })

    expect(response.status).toBe(200)
    expect(response.body.entry.value).toBe(150)
    expect(response.body.entry.note).toBe('Updated note')
  })

  it('should fail for non-existent entry', async () => {
    const response = await request(app)
      .patch(`/api/goals/${goalId}/progress/550e8400-e29b-41d4-a716-446655440000`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 150 })

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app)
      .patch(`/api/goals/${goalId}/progress/${entryId}`)
      .send({ value: 150 })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/goals/:id/progress/:entryId', () => {
  let goalId: string
  let entryId: string

  beforeEach(async () => {
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goalType: 'TARGET_BASED',
        title: 'Test Goal',
        unit: 'dollars',
        targetValue: 1000,
        deadline: '2025-12-31T00:00:00Z',
      })
    goalId = goalResponse.body.goal.id

    const entryResponse = await request(app)
      .post(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ value: 100 })
    entryId = entryResponse.body.entry.id
  })

  afterEach(async () => {
    await prisma.goal.deleteMany({ where: { userId } })
  })

  it('should delete progress entry successfully', async () => {
    const response = await request(app)
      .delete(`/api/goals/${goalId}/progress/${entryId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success')

    // Verify deletion
    const entriesResponse = await request(app)
      .get(`/api/goals/${goalId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(entriesResponse.body.entries.length).toBe(0)
  })

  it('should recalculate goal currentValue after deleting progress', async () => {
    await request(app)
      .delete(`/api/goals/${goalId}/progress/${entryId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    const goalResponse = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(goalResponse.body.goal.currentValue).toBe(0)
  })

  it('should fail for non-existent entry', async () => {
    const response = await request(app)
      .delete(`/api/goals/${goalId}/progress/550e8400-e29b-41d4-a716-446655440000`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
  })

  it('should fail without authentication', async () => {
    const response = await request(app)
      .delete(`/api/goals/${goalId}/progress/${entryId}`)

    expect(response.status).toBe(401)
  })
})

