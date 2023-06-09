import { MissingParamError } from "../../errors"
import { Validation } from "./validation"
import { ValidationComposite } from "./validation-composite"

describe('Validation Composite', () => {

  const makeValidation = (): Validation => {
    class ValidationStub implements Validation {
      validate(input: any): Error {
          return new MissingParamError('field')
      } 
    }
    return new ValidationStub()
  }

  interface SutTypes {
    sut: ValidationComposite
    validationStubs: Validation[]
  }

  const makeSut = (): SutTypes => { 
    const validationStubs = [
      makeValidation(), 
      makeValidation()
    ]
    const sut = new ValidationComposite(validationStubs)
    return {
      sut, 
      validationStubs
    }
  }

  test('Should return an error if any validation fails', () => {
    const { sut, validationStubs } = makeSut()
    jest.spyOn(validationStubs[1  ], 'validate').mockReturnValueOnce(new MissingParamError('field'))
    const error = sut.validate({field: 'any_value'})
    expect(error).toEqual(new MissingParamError('field'))
  })

  test('Should return an error if any validation fails', () => {
    const { sut, validationStubs } = makeSut()
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new Error())
    jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field'))
    const error = sut.validate({field: 'any_value'})
    expect(error).toEqual(new Error())
  })

  // test('Should return if validation succeeds', () => {
  //   const { sut } = makeSut()
  //   const error = sut.validate({field: 'any_value'})
  //   console.log(error)
  //   expect(error).toBeFalsy()
  // })
})