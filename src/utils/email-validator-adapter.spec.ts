import { EmailValidatorAdapter } from "./email-validator"
import  validtor from 'validator'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

describe("EmailValidator Adapter", () =>{
  test('Should return false if validator return false', () => {
     const sut = new EmailValidatorAdapter()
     jest.spyOn(validtor, 'isEmail').mockReturnValueOnce(false)
     const isValid = sut.isValid('invalid_email@mail.com')
     expect(isValid).toBe(false)
  })
  
  test('Should return false if validator return true', () => {
     const sut = new EmailValidatorAdapter()
     const isValid = sut.isValid('valid_email@mail.com')
     expect(isValid).toBe(true)
  })
})