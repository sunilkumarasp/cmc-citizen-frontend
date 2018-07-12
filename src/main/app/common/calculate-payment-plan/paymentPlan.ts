import * as moment from 'moment'
import 'moment-precise-range-plugin'
import { MomentFactory } from 'shared/momentFactory'

class PaymentPlan {
  private numberOfInstalments: number

  constructor (
    totalAmount: number,
    instalmentAmount: number,
    private frequencyInWeeks: number) {
    this.numberOfInstalments = totalAmount / instalmentAmount
  }

  getPaymentLength (): string {
    const now: moment.Moment = MomentFactory.currentDate()
    const lastPaymentDate: moment.Moment = this.getLastPaymentDate(now)

    const { years, months, days } = (moment as any).preciseDiff(now, lastPaymentDate, true)
    const paymentLength: Array<string> = []

    if (years) {
      paymentLength.push(this.pluralize(years, 'year'))
    }

    if (months) {
      paymentLength.push(this.pluralize(months, 'month'))
    }

    if (days) {
      const weeks = moment.duration(days, 'day').get('week')

      if (weeks) {
        paymentLength.push(this.pluralize(weeks, 'week'))
      }
    }

    return paymentLength.join(' ')
  }

  private pluralize (num: number, word: string) {
    const plural: string = num < 2 ? '' : 's'
    return `${num} ${word}${plural}`
  }

  getLastPaymentDate (fromDate: moment.Moment = MomentFactory.currentDate()): moment.Moment {
    const timeToCompletePaymentsInWeeks: number = this.numberOfInstalments * this.frequencyInWeeks
    return fromDate.clone().add(timeToCompletePaymentsInWeeks, 'weeks')
  }
}

export function createPaymentPlan (
  totalAmount: number,
  instalmentAmount: number,
  frequencyInWeeks: number): PaymentPlan {
  return new PaymentPlan(totalAmount, instalmentAmount, frequencyInWeeks)
}