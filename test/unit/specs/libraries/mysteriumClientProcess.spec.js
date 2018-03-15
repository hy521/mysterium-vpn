/* eslint-disable no-unused-expressions */
import Process from '../../../../src/libraries/mysterium-client/standalone/process'
// eslint-disable-next-line import/no-webpack-loader-syntax
import configInjector from 'inject-loader!../../../../src/app/mysterion-config'
import {ChildProcess} from 'child_process'
import delay from '../../../../src/libraries/delay-as-promised'
import tequilAPI from '../../../../src/libraries/api/tequilapi'

const config = configInjector({
  'electron': {
    app: {
      getPath () {
        return './test/mocks'
      },
      getAppPath () {
        return './src/main/'
      }
    }
  }
}).default

describe('Standalone Process', async () => {
  const port = 4055
  const tequilapi = tequilAPI(`http://127.0.0.1:${port}`)
  const process = new Process(config)
  await delay(50)

  it('spawns in less than 50ms without errors', () => {
    process.start(port)
    expect(process.child).to.be.instanceOf(ChildProcess)
  })
  it('responds to healthcheck with uptime', async () => {
    const res = await tequilapi.healthCheck()
    expect(res.uptime).to.be.ok
    expect(res.version).to.be.ok
  })
  it('responds to healthcheck with version string', async () => {
    const res = await tequilapi.healthCheck()
    expect(res.version).to.include.all.keys(['branch', 'commit', 'buildNumber'])
  })
})
