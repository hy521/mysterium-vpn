/*
 * Copyright (C) 2017 The "MysteriumNetwork/mysterion" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow
import os from 'os'
import path from 'path'
import { Tail } from 'tail'

import type { Container } from '../../../app/di'
import type { MysterionConfig } from '../../../app/mysterionConfig'
import type { LogCallback } from '../../../libraries/mysterium-client'
import type { TailFunction } from '../../../libraries/mysterium-client/client-log-subscriber'
import type { ClientConfig } from '../../../libraries/mysterium-client/config'
import type { TequilapiClient } from '../../../libraries/mysterium-tequilapi/client'

import { Monitoring } from '../../../libraries/mysterium-client'
import ClientLogSubscriber from '../../../libraries/mysterium-client/client-log-subscriber'

import LaunchDaemonInstaller from '../../../libraries/mysterium-client/launch-daemon/launch-daemon-installer'
import LaunchDaemonProcess from '../../../libraries/mysterium-client/launch-daemon/launch-daemon-process'

import StandaloneClientInstaller from '../../../libraries/mysterium-client/standalone/standalone-client-installer'
import StandaloneClientProcess from '../../../libraries/mysterium-client/standalone/standalone-client-process'

import ServiceManagerInstaller from '../../../libraries/mysterium-client/service-manager/service-manager-installer'
import ServiceManagerProcess from '../../../libraries/mysterium-client/service-manager/service-manager-process'

import { LAUNCH_DAEMON_PORT } from '../../../libraries/mysterium-client/launch-daemon/config'
import OSSystem from '../../../libraries/mysterium-client/system'

const WINDOWS = 'win32'
const OSX = 'darwin'

function bootstrap (container: Container) {
  container.constant('mysteriumClient.platform', os.platform())

  container.service(
    'mysteriumClient.config',
    ['mysterionApplication.config'],
    (mysterionConfig: MysterionConfig): ClientConfig => {
      let clientBin = path.join(mysterionConfig.contentsDirectory, 'bin', 'mysterium_client')
      let openvpnBin = path.join(mysterionConfig.contentsDirectory, 'bin', 'openvpn')

      if (os.platform() === WINDOWS) {
        clientBin += '.exe'
        openvpnBin += '.exe'
      }

      return {
        clientBin: clientBin,
        configDir: path.join(mysterionConfig.contentsDirectory, 'bin', 'config'),
        openVPNBin: openvpnBin,
        dataDir: mysterionConfig.userDataDirectory,
        runtimeDir: mysterionConfig.runtimeDirectory,
        logDir: mysterionConfig.userDataDirectory,
        stdOutFileName: 'stdout.log',
        stdErrFileName: 'stderr.log',
        systemLogPath: '/var/log/system.log',
        tequilapiPort: 4050
      }
    }
  )
  container.service(
    'mysteriumClientInstaller',
    ['mysterionApplication.config', 'mysteriumClient.config', 'mysteriumClient.platform'],
    (mysterionConfig: MysterionConfig, config: ClientConfig, platform: string) => {
      switch (platform) {
        case OSX:
          return new LaunchDaemonInstaller(config)
        case WINDOWS:
          return new ServiceManagerInstaller(new OSSystem(), config, path.join(mysterionConfig.contentsDirectory, 'bin'))
        default:
          return new StandaloneClientInstaller()
      }
    }
  )

  container.service(
    'mysteriumClient.tailFunction', [], () => {
      return (file: string, logCallback: LogCallback) => {
        const logTail = new Tail(file)
        logTail.on('line', logCallback)
        logTail.on('error', () => {
          // eslint-disable-next-line
          console.error(`log file watching failed. file probably doesn't exist: ${file}`)
        })
      }
    }
  )

  container.service(
    'mysteriumClient.logSubscriber',
    ['mysteriumClient.config', 'mysteriumClient.tailFunction'],
    (config: ClientConfig, tailFunction: TailFunction) => {
      return new ClientLogSubscriber(
        path.join(config.logDir, config.stdOutFileName),
        path.join(config.logDir, config.stdErrFileName),
        config.systemLogPath,
        () => new Date(),
        tailFunction
      )
    }
  )

  container.service(
    'mysteriumClientProcess',
    ['tequilapiClient', 'mysteriumClient.config', 'mysteriumClient.logSubscriber', 'mysteriumClient.platform',
      'mysterionApplication.config', 'mysteriumClientMonitoring'],
    (tequilapiClient: TequilapiClient, config: ClientConfig, logSubscriber: ClientLogSubscriber, platform: string,
      mysterionConfig: MysterionConfig, monitoring: Monitoring) => {
      switch (platform) {
        case OSX:
          return new LaunchDaemonProcess(tequilapiClient, logSubscriber, LAUNCH_DAEMON_PORT)
        case WINDOWS:
          return new ServiceManagerProcess(
            tequilapiClient,
            logSubscriber,
            path.join(mysterionConfig.contentsDirectory, 'bin'),
            new OSSystem(),
            monitoring)
        default:
          return new StandaloneClientProcess(config)
      }
    }
  )

  container.service(
    'mysteriumClientMonitoring',
    ['tequilapiClient'],
    (tequilapiClient) => new Monitoring(tequilapiClient)
  )
}

export default bootstrap
