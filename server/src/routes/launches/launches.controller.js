const {
  getAllLaunches,
  scheduleNewLaunch,
  exitsLaunchWithId,
  abortLaunchById
} = require('../../models/launches.model')

const {
  getPagination
} = require('../../services/query')

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query)
  const launches = await getAllLaunches(skip, limit)
  return res.status(200).json(launches)
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body

  if (!launch.mission || !launch.launchDate || !launch.rocket || !launch.target) {
    return res.status(400).json({
      error: 'Missing required launch property.'
    })
  }

  launch.launchDate = new Date(launch.launchDate)

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date.'
    })
  }

  await scheduleNewLaunch(launch)
  return res.status(201).json(launch)
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id)

  const exitsLaunch = await exitsLaunchWithId(launchId)
  // if not found exitsLaunch will return 'null', response 404
  if (!exitsLaunch) {
    return res.status(404).json({
      error: 'Launch not found'
    })
  }

  const aborted = await abortLaunchById(launchId)
  // if aborted failed, response 400
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted'
    })
  }

  // use return just in case response replicate, use only res.status.json is fine
  return res.status(200).json({
    ok: true
  })
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
}