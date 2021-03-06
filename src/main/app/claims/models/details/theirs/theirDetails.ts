import { Address } from 'claims/models/address'
import { PartyType } from 'common/partyType'

export class TheirDetails {
  type: string
  name: string
  address: Address
  email?: string
  phone?: string
  title?: string
  firstName?: string
  lastName?: string

  constructor (type?: string, name?: string, address?: Address, email?: string, phone?: string) {
    this.type = type
    this.name = name
    this.address = address
    this.email = email
    this.phone = phone
  }

  isBusiness (): boolean {
    return this.type === PartyType.COMPANY.value || this.type === PartyType.ORGANISATION.value
  }

  deserialize (input: any): TheirDetails {
    if (input) {
      this.type = input.type
      this.name = input.name
      if (input.address) {
        this.address = new Address().deserialize(input.address)
      }
      if (input.title) {
        this.title = input.title
      }
      if (input.firstName) {
        this.firstName = input.firstName
      }
      if (input.lastName) {
        this.lastName = input.lastName
      }
      this.email = input.email
      this.phone = input.phone
    }
    return this
  }
}
