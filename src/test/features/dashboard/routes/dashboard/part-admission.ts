import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'

import { attachDefaultHooks } from 'test/routes/hooks'
import 'test/routes/expectations'

import { Paths } from 'dashboard/paths'

import { app } from 'main/app'

import * as idamServiceMock from 'test/http-mocks/idam'
import * as draftStoreServiceMock from 'test/http-mocks/draft-store'
import * as claimStoreServiceMock from 'test/http-mocks/claim-store'
// import * as moment from 'moment'
import { MomentFactory } from 'shared/momentFactory'

import {
  basePartialAdmissionData,
  basePayByInstalmentsData,
  basePayBySetDateData,
  basePayImmediatelyData,
  baseResponseData
} from 'test/data/entity/responseData'

import {
  claimantResponseAt,
  claimantReferredToJudgeResponse,
  claimantReferredToJudgeResponseForInstalments,
  claimantAcceptRepaymentPlan,
  settlementOfferBySetDate,
  settlementOfferByInstalments,
  settlementOfferAcceptBySetDate,
  settlementOfferAcceptInInstalment,
  settledWithAgreementBySetDate,
  settledWithAgreementInInstalments,
  settledWithAgreementBySetDatePastPaymentDeadline,
  settledWithAgreementInInstalmentsPastPaymentDeadline,
  defendantRejectedSettlementOfferAcceptBySetDate,
  defendantRejectedSettlementOfferAcceptInInstalments,
  claimantAcceptRepaymentPlanByDetermination,
  claimantAcceptRepaymentPlanInInstalmentsByDetermination,
  partialAdmissionAlreadyPaidData
} from 'test/data/entity/partAdmitData'

const cookieName: string = config.get<string>('session.cookieName')

const partialAdmissionClaim = {
  ...claimStoreServiceMock.sampleClaimObj,
  responseDeadline: MomentFactory.currentDate().add(1, 'days'),
  response: {
    ...baseResponseData,
    ...basePartialAdmissionData
  },
  claimantResponseAt: { ...claimantResponseAt }
}

const testData = [
  {
    status: 'Partial admission - defendant responded pay immediately',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayImmediatelyData }
    },
    claimantAssertions: ['Respond to the defendant.'],
    defendantAssertions: ['You’ve admitted part of the claim.']
  },
  {
    status: 'Partial admission - defendant responded pay immediately - past payment deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayImmediatelyData },
      responseDeadline: MomentFactory.currentDate().subtract(1, 'days')
    },
    claimantAssertions: ['Respond to the defendant.'],
    defendantAssertions: ['You’ve admitted part of the claim.']
  },

  {
    status: 'Partial admission - defendant responded pay by set date',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      ...settlementOfferBySetDate
    },
    claimantAssertions: ['Respond to the defendant.'],
    defendantAssertions: ['You’ve admitted part of the claim.']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant rejects repayment plan and referred to judge',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantResponse: { ...claimantReferredToJudgeResponse }
    },
    claimantAssertions: ['Awaiting judge’s review.'],
    defendantAssertions: [partialAdmissionClaim.claim.claimants[0].name + ' requested a County Court Judgment against you']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by admission and offered a settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settlementOfferAcceptBySetDate
    },
    claimantAssertions: ['You’ve signed a settlement agreement. The defendant can choose to sign it or not.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by admission and offered a settlement agreement - defendant past counter signature deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settlementOfferAcceptBySetDate
    },
    claimantAssertions: ['The defendant has not responded to your settlement agreement. You can request a County Court Judgment against them.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by admission and offered a settlement agreement - defendant signed agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate(),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settledWithAgreementBySetDate
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by admission and offered a settlement agreement - defendant signed agreement - past payment deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settledWithAgreementBySetDatePastPaymentDeadline
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by admission and offered a settlement agreement - defendant rejects settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...defendantRejectedSettlementOfferAcceptBySetDate
    },
    claimantAssertions: [`${partialAdmissionClaim.claim.defendants[0].name} has rejected your settlement agreement. You can request a County Court Judgment against them.`],
    defendantAssertions: ['You rejected the settlement agreement.']
  },

  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by determination and offered a settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantResponse: { ...claimantAcceptRepaymentPlanByDetermination },
      ...settlementOfferAcceptBySetDate
    },
    claimantAssertions: ['You’ve signed a settlement agreement. The defendant can choose to sign it or not.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by determination and offered a settlement agreement - defendant past counter signature deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanByDetermination },
      ...settlementOfferAcceptBySetDate
    },
    claimantAssertions: ['The defendant has not responded to your settlement agreement. You can request a County Court Judgment against them.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]

  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by determination and offered a settlement agreement - defendant signed agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate(),
      claimantResponse: { ...claimantAcceptRepaymentPlanByDetermination },
      ...settledWithAgreementBySetDate
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by determination and offered a settlement agreement - defendant signed agreement - past payment deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanByDetermination },
      ...settledWithAgreementBySetDatePastPaymentDeadline
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay by set date - claimant accepts repayment plan by determination and offered a settlement agreement - defendant rejects settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayBySetDateData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanByDetermination },
      ...defendantRejectedSettlementOfferAcceptBySetDate
    },
    claimantAssertions: [`${partialAdmissionClaim.claim.defendants[0].name} has rejected your settlement agreement. You can request a County Court Judgment against them.`],
    defendantAssertions: ['You rejected the settlement agreement.']
  },

  {
    status: 'Partial admission - defendant responded pay in instalments',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      ...settlementOfferByInstalments
    },
    claimantAssertions: ['Respond to the defendant.'],
    defendantAssertions: ['You’ve admitted part of the claim.']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant rejects court repayment plan and referred to judge',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantResponse: { ...claimantReferredToJudgeResponseForInstalments }
    },
    claimantAssertions: ['Awaiting judge’s review.'],
    defendantAssertions: [partialAdmissionClaim.claim.claimants[0].name + ' requested a County Court Judgment against you']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by admission and offered a settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settlementOfferAcceptInInstalment
    },
    claimantAssertions: ['You’ve signed a settlement agreement. The defendant can choose to sign it or not.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by admission and offered a settlement agreement - defendant past counter signature deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settlementOfferAcceptInInstalment
    },
    claimantAssertions: ['The defendant has not responded to your settlement agreement. You can request a County Court Judgment against them.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by admission and offered a settlement agreement - defendant signed settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate(),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settledWithAgreementInInstalments
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by admission and offered a settlement agreement - defendant signed settlement agreement - past payment deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...settledWithAgreementInInstalmentsPastPaymentDeadline
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by admission and offered a settlement agreement - defendant rejects settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate(),
      claimantResponse: { ...claimantAcceptRepaymentPlan },
      ...defendantRejectedSettlementOfferAcceptInInstalments
    },
    claimantAssertions: [`${partialAdmissionClaim.claim.defendants[0].name} has rejected your settlement agreement. You can request a County Court Judgment against them.`],
    defendantAssertions: ['You rejected the settlement agreement.']
  },

  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by determination and offered a settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantResponse: { ...claimantAcceptRepaymentPlanInInstalmentsByDetermination },
      ...settlementOfferAcceptInInstalment
    },
    claimantAssertions: ['You’ve signed a settlement agreement. The defendant can choose to sign it or not.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by determination and offered a settlement agreement - defendant past counter signature deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanInInstalmentsByDetermination },
      ...settlementOfferAcceptInInstalment
    },
    claimantAssertions: ['The defendant has not responded to your settlement agreement. You can request a County Court Judgment against them.'],
    defendantAssertions: [`${partialAdmissionClaim.claim.claimants[0].name} asked you to sign a settlement agreement.`]

  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by determination  and offered a settlement agreement - defendant signed settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate(),
      claimantResponse: { ...claimantAcceptRepaymentPlanInInstalmentsByDetermination },
      ...settledWithAgreementInInstalments
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by determination and offered a settlement agreement - defendant signed settlement agreement - past payment deadline',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanInInstalmentsByDetermination },
      ...settledWithAgreementInInstalmentsPastPaymentDeadline
    },
    claimantAssertions: ['You’ve both signed a settlement agreement.'],
    defendantAssertions: ['You’ve both signed a settlement agreement.']
  },
  {
    status: 'Partial admission - defendant responded pay in instalments - claimant accepts repayment plan by determination and offered a settlement agreement - defendant rejects settlement agreement',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionClaim.response, ...basePayByInstalmentsData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days'),
      claimantResponse: { ...claimantAcceptRepaymentPlanInInstalmentsByDetermination },
      ...defendantRejectedSettlementOfferAcceptInInstalments
    },
    claimantAssertions: [`${partialAdmissionClaim.claim.defendants[0].name} has rejected your settlement agreement. You can request a County Court Judgment against them.`],
    defendantAssertions: ['You rejected the settlement agreement.']
  },
  {
    status: 'Partial admission - defendant states paid, less than claim amount accepted',
    claim: partialAdmissionClaim,
    claimOverride: {
      response: { ...partialAdmissionAlreadyPaidData },
      claimantRespondedAt: MomentFactory.currentDate().subtract(8, 'days')
    },
    claimantAssertions: 'Respond to the defendant.',
    defendantAssertions: 'You’ve admitted part of the claim.'
  }
]

describe('Dashboard page', () => {
  attachDefaultHooks(app)

  describe('on GET', () => {

    context('when user authorised', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor('1', 'citizen')
      })

      context('Dashboard Status', () => {
        context('as a claimant', () => {
          beforeEach(() => {
            claimStoreServiceMock.resolveRetrieveByDefendantIdToEmptyList()
          })

          testData.forEach(data => {
            it(`should render dashboard: ${data.status}`, async () => {
              draftStoreServiceMock.resolveFindNoDraftFound()
              claimStoreServiceMock.resolveRetrieveByClaimantId(data.claim, data.claimOverride)
              await request(app)
                .get(Paths.dashboardPage.uri)
                .set('Cookie', `${cookieName}=ABC`)
                .expect(res => expect(res).to.be.successful.withText(...data.claimantAssertions))
            })
          })
        })

        context('as a defendant', () => {
          beforeEach(() => {
            claimStoreServiceMock.resolveRetrieveByClaimantIdToEmptyList()
          })

          testData.forEach(data => {
            it(`should render dashboard: ${data.status}`, async () => {
              draftStoreServiceMock.resolveFindNoDraftFound()
              claimStoreServiceMock.resolveRetrieveByDefendantId(data.claim.referenceNumber, '1', data.claim, data.claimOverride)
              await request(app)
                .get(Paths.dashboardPage.uri)
                .set('Cookie', `${cookieName}=ABC`)
                .expect(res => expect(res).to.be.successful.withText(...data.defendantAssertions))
            })
          })
        })
      })
    })
  })
})