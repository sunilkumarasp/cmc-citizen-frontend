import { IsArray, ValidateNested } from 'class-validator'
import { IncomeExpenseSource } from 'common/calculate-monthly-income-expense/incomeExpenseSource'
import { MonthlyIncome } from 'response/form/models/statement-of-means/monthlyIncome'
import { MonthlyExpenses } from 'response/form/models/statement-of-means/monthlyExpenses'

export class IncomeExpenseSources {

  @ValidateNested()
  @IsArray()
  incomeExpenseSources?: IncomeExpenseSource[]

  constructor (incomeExpenseSources: IncomeExpenseSource[]) {
    this.incomeExpenseSources = incomeExpenseSources
  }

  static fromObject (value?: any): IncomeExpenseSources {
    if (!value) {
      return value
    }

    if (!Array.isArray(value.incomeExpenseSources)) {
      throw new Error('Invalid value: missing array')
    }

    return new IncomeExpenseSources(value.incomeExpenseSources.map(
      incomeExpenseSource => IncomeExpenseSource.fromObject(incomeExpenseSource)
    ))
  }

  static fromMonthlyExpensesFormModel (monthlyExpenses: MonthlyExpenses): IncomeExpenseSources {
    if (!monthlyExpenses) {
      return undefined
    }

    const incomeExpenseSources = []

    if (monthlyExpenses.mortgage && monthlyExpenses.mortgage.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.mortgage))
    }

    if (monthlyExpenses.rent && monthlyExpenses.rent.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.rent))
    }

    if (monthlyExpenses.councilTax && monthlyExpenses.councilTax.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.councilTax))
    }

    if (monthlyExpenses.gas && monthlyExpenses.gas.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.gas))
    }

    if (monthlyExpenses.electricity && monthlyExpenses.electricity.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.electricity))
    }

    if (monthlyExpenses.water && monthlyExpenses.water.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.water))
    }

    if (monthlyExpenses.travel && monthlyExpenses.travel.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.travel))
    }

    if (monthlyExpenses.schoolCosts && monthlyExpenses.schoolCosts.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.schoolCosts))
    }

    if (monthlyExpenses.foodAndHousekeeping && monthlyExpenses.foodAndHousekeeping.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.foodAndHousekeeping))
    }

    if (monthlyExpenses.tvAndBroadband && monthlyExpenses.tvAndBroadband.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.tvAndBroadband))
    }

    if (monthlyExpenses.hirePurchase && monthlyExpenses.hirePurchase.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.hirePurchase))
    }

    if (monthlyExpenses.mobilePhone && monthlyExpenses.mobilePhone.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.mobilePhone))
    }

    if (monthlyExpenses.maintenance && monthlyExpenses.maintenance.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyExpenses.maintenance))
    }

    if (monthlyExpenses.anyOtherPopulated) {
      incomeExpenseSources.push(...monthlyExpenses.other
        .filter(source => source.populated)
        .map(source => IncomeExpenseSource.fromFormModel(source)))
    }

    return new IncomeExpenseSources(incomeExpenseSources)
  }

  static fromMonthlyIncomeFormModel (monthlyIncome: MonthlyIncome): IncomeExpenseSources {
    if (!monthlyIncome) {
      return undefined
    }

    const incomeExpenseSources = []

    if (monthlyIncome.salarySource && monthlyIncome.salarySource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.salarySource))
    }

    if (monthlyIncome.universalCreditSource && monthlyIncome.universalCreditSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.universalCreditSource))
    }

    if (monthlyIncome.jobseekerAllowanceIncomeSource && monthlyIncome.jobseekerAllowanceIncomeSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.jobseekerAllowanceIncomeSource))
    }

    if (monthlyIncome.jobseekerAllowanceContributionSource && monthlyIncome.jobseekerAllowanceContributionSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.jobseekerAllowanceContributionSource))
    }

    if (monthlyIncome.incomeSupportSource && monthlyIncome.incomeSupportSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.incomeSupportSource))
    }

    if (monthlyIncome.workingTaxCreditSource && monthlyIncome.workingTaxCreditSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.workingTaxCreditSource))
    }

    if (monthlyIncome.childTaxCreditSource && monthlyIncome.childTaxCreditSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.childTaxCreditSource))
    }

    if (monthlyIncome.childBenefitSource && monthlyIncome.childBenefitSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.childBenefitSource))
    }

    if (monthlyIncome.councilTaxSupportSource && monthlyIncome.councilTaxSupportSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.councilTaxSupportSource))
    }

    if (monthlyIncome.pensionSource && monthlyIncome.pensionSource.populated) {
      incomeExpenseSources.push(IncomeExpenseSource.fromFormModel(monthlyIncome.pensionSource))
    }

    if (monthlyIncome.anyOtherIncomePopulated) {
      incomeExpenseSources.push(...monthlyIncome.otherSources
        .filter(source => source.populated)
        .map(source => IncomeExpenseSource.fromFormModel(source)))
    }
    return new IncomeExpenseSources(incomeExpenseSources)
  }
}