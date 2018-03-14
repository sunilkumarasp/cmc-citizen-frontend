import { IsDefined, IsIn, IsPositive, MaxLength, ValidateIf } from 'class-validator'
import { IsNotBlank } from 'app/forms/validation/validators/isBlank'
import { CompletableTask } from 'app/models/task'
import { toNumberOrUndefined } from 'common/utils/numericUtils'
import { ValidationErrors as CommonValidationErrors } from 'app/forms/validation/validationErrors'
import { getStandardInterestRate } from 'common/interestUtils'

export class InterestRateOption {
  static readonly STANDARD: string = 'standard'
  static readonly DIFFERENT: string = 'different'

  static all (): string[] {
    return [
      InterestRateOption.STANDARD,
      InterestRateOption.DIFFERENT
    ]
  }
}

export class ValidationErrors {
  static readonly TYPE_REQUIRED: string = 'Choose a rate of interest'

  static readonly RATE_REQUIRED: string = 'You haven’t entered a rate'
  static readonly RATE_NOT_VALID: string = 'Correct the rate you’ve entered'
}

export class InterestRate implements CompletableTask {

  @IsDefined({ message: ValidationErrors.TYPE_REQUIRED })
  @IsIn(InterestRateOption.all(), { message: ValidationErrors.TYPE_REQUIRED })
  type?: string

  @ValidateIf(o => o.type === InterestRateOption.DIFFERENT)
  @IsDefined({ message: ValidationErrors.RATE_REQUIRED })
  @IsPositive({ message: ValidationErrors.RATE_NOT_VALID })
  rate?: number

  @ValidateIf(o => o.type === InterestRateOption.DIFFERENT)
  @IsDefined({ message: CommonValidationErrors.REASON_REQUIRED })
  @IsNotBlank({ message: CommonValidationErrors.REASON_REQUIRED })
  @MaxLength(250, { message: CommonValidationErrors.REASON_TOO_LONG })
  reason?: string

  constructor (type?: string, rate?: number, reason?: string) {
    this.type = type
    this.rate = rate
    this.reason = reason
  }

  static fromObject (value?: any): InterestRate {
    if (value == null) {
      return value
    }

    const instance = new InterestRate(value.type, toNumberOrUndefined(value.rate), value.reason)

    switch (instance.type) {
      case InterestRateOption.STANDARD:
        instance.rate = getStandardInterestRate()
        instance.reason = undefined
        break
    }

    return instance
  }

  deserialize (input?: any): InterestRate {
    if (input) {
      this.type = input.type
      this.rate = input.rate
      this.reason = input.reason
    }

    return this
  }

  isCompleted (): boolean {
    return !!this.type && (this.type === InterestRateOption.STANDARD || this.type === InterestRateOption.DIFFERENT)
  }
}
