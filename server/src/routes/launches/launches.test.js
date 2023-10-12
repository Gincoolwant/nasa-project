const request = require('supertest')
const app = require('../../app')
const {
  mongoConnect,
  mongoDisconnect
} = require('../../services/mongo')


describe('Launches APIs', () => {
  beforeAll(async () => {
    await mongoConnect()
  })

  afterAll(async () => {
    await mongoDisconnect()
  })

  describe('TEST GET /launches', () => {
    test('it should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect(200)
        .expect('Content-Type', /json/)
    })
  })

  describe('TEST POST /launches', () => {
    const completeLaunchData = {
      mission: 'GoGoPower',
      rocket: 'NCD 1007',
      target: 'Kepler-62 f',
      launchDate: 'January 1, 2020'
    }

    const launchDataWithoutDate = {
      mission: 'GoGoPower',
      rocket: 'NCD 1007',
      target: 'Kepler-62 f'
    }

    const launchDataWithInvalidDate = {
      mission: 'GoGoPower',
      rocket: 'NCD 1007',
      target: 'Kepler-62 f',
      launchDate: 'foo'
    }

    test('it should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect(201)
        .expect('Content-Type', /json/)

      const responseDate = new Date(response.body.launchDate).valueOf
      const requestDate = new Date(completeLaunchData.launchDate).valueOf

      expect(response.body).toMatchObject(launchDataWithoutDate)
      expect(responseDate).toBe(requestDate)
    })


    test('it should catch miss required property', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect(400)
        .expect('Content-Type', /json/)

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property.'
      })
    })

    test('it should catch invalid launch dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect('Content-Type', /json/)

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date.'
      })
    })
  })
})