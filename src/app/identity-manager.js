/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn" Authors.
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

import type { IdentityDTO } from 'mysterium-tequilapi/lib/dto/identity'
import type { IdentityRegistrationDTO } from 'mysterium-tequilapi/lib/dto/identity-registration/identity-registration'
import type { TequilapiClient } from 'mysterium-tequilapi/lib/client'
import messages from './messages'
import Publisher from '../libraries/publisher'

const PASSWORD = ''

/**
 * Allows managing identities using TequilapiClient and persisting data in identities module.
 */
class IdentityManager {
  _tequilapi: TequilapiClient

  _currentIdentity: ?IdentityDTO = null
  _registration: ?IdentityRegistrationDTO

  _currentIdentityPublisher: Publisher<IdentityDTO> = new Publisher()
  _registrationPublisher: Publisher<IdentityRegistrationDTO> = new Publisher()
  _errorMessagePublisher: Publisher<string> = new Publisher()

  constructor (tequilapi: TequilapiClient) {
    this._tequilapi = tequilapi
  }

  async listIdentities (): Promise<Array<IdentityDTO>> {
    try {
      return await this._tequilapi.identitiesList()
    } catch (err) {
      this._showErrorMessage(messages.identityListFailed)
      throw err
    }
  }

  get currentIdentity (): ?IdentityDTO {
    return this._currentIdentity
  }

  onCurrentIdentityChange (callback: IdentityDTO => void) {
    this._currentIdentityPublisher.addSubscriber(callback)
  }

  setRegistration (registration: IdentityRegistrationDTO) {
    this._registration = registration
    this._registrationPublisher.publish(registration)
  }

  onRegistrationChange (subscriber: IdentityRegistrationDTO => any) {
    this._registrationPublisher.addSubscriber(subscriber)
  }

  async createIdentity (): Promise<IdentityDTO> {
    try {
      return await this._tequilapi.identityCreate(PASSWORD)
    } catch (err) {
      this._showErrorMessage(messages.identityCreateFailed)
      throw err
    }
  }

  async unlockIdentity (identity: IdentityDTO): Promise<void> {
    if (!identity.id) {
      const message = 'Cannot unlock invalid identity'
      this._showErrorMessage(message)

      throw new Error(message)
    }

    try {
      await this._tequilapi.identityUnlock(identity.id, PASSWORD)
    } catch (err) {
      this._showErrorMessage(messages.identityUnlockFailed)
      throw err
    }

    this._setCurrentIdentity(identity)
  }

  async fetchEthAddress (): Promise<?string> {
    if (!this.currentIdentity) {
      throw new Error('Cannot fetch eth address without current identity')
    }

    try {
      const payout = await this._tequilapi.identityPayout(this.currentIdentity.id)
      return payout.ethAddress
    } catch (err) {
      if (err.isNotFoundError) {
        return null
      }
      throw err
    }
  }

  onErrorMessage (callback: string => void) {
    this._errorMessagePublisher.addSubscriber(callback)
  }

  _setCurrentIdentity (identity: IdentityDTO) {
    this._currentIdentity = identity
    this._currentIdentityPublisher.publish(identity)
  }

  // TODO: this class should not show errors in case VpnInitializer is run with multiple retries
  _showErrorMessage (message: string): void {
    this._errorMessagePublisher.publish(message)
  }
}

export default IdentityManager
