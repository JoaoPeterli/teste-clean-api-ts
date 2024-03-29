import { Authentication } from "../../../domain/usecases/authentication"
import { InvalidParamError, MissingParamError } from "../../errors"
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { EmailValidator } from "../../protocols/email-validator"
import { HttpRequest, Validation } from "../signup/signup-protocols"
import { LoginController } from "./login"

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
        return true
    }
  }
  return new EmailValidatorStub()
}

const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth(email: string, password: string): Promise<string> {
        return  new Promise(resolve => resolve('any_token'))
    }
  }
  return new AuthenticationStub()
}
const makeFakeRequest = (): HttpRequest => ({
    body: {
      email: 'any_email@mail.com',
      password: 'any_password'
    }
})

const makeValidation = ():  Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error{
      return null
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: LoginController
  emailValidatorStub: EmailValidator
  authenticationStub: Authentication
 }

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const authenticationStub = makeAuthentication()
  const sut  = new LoginController(emailValidatorStub, authenticationStub)
  return {
    sut,
    emailValidatorStub,
    authenticationStub
  }
}

describe('Login Controller', () => {
  test('Should return 400 if no email is  provided', async () => {
     const { sut } = makeSut()
     const httpRequest = {
      body: {
        password: 'any_password'
      }
     }
     const httpResponse = await sut.handle(httpRequest)
     expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
  })
  
  test('Should return 400 if no password is  provided', async () => {
     const  { sut } = makeSut()
     const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
     }
     const httpResponse = await sut.handle(httpRequest)
     expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  test('Should return 400 if an invalid email is provided', async () => {
     const  { sut, emailValidatorStub } = makeSut()
     jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
     const httpResponse = await sut.handle(makeFakeRequest())
     expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  }) 

  test('Should call EmailValidator with correct email', async () => {
     const  { sut, emailValidatorStub } = makeSut()
     const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
     await sut.handle(makeFakeRequest())
     expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
  
  test('Should return 500 if EmailValidator throws', async () => {
     const  { sut, emailValidatorStub } = makeSut()
     jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
        throw new Error()
     })
    const httpResponse =  await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError( new Error()))
  })

  test('Should call Autehntication with correct values', async () => {
    const  { sut, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith('any_email@mail.com', 'any_password')
 })

 test('Should return 401 if invalid credentials are provided', async () => {
    const  { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const httpResponse =  await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })
  
  test('Should return 500 if Authentication throws', async () => {
    const  { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce( new Promise((resolve, reject) => reject(new Error())))
    const httpResponse =  await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
  
  test('Should return 201 if valid credentials are provided', async () => {
    const  { sut } = makeSut()
    const httpResponse =  await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ accessToken: 'any_token'}))
  })

  // test('Should call Validation  with correct values', () => {
  //   const { sut, validationStub } = makeSut() 
  //   const validateSpy = jest.spyOn( validationStub, "validate")
  //   const httpRequest = makeFakeRequest()
  //   sut.handle(httpRequest)    
  //   expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  // })
  
  // test('Should return 400 if Validation returns an error', async () => {
  //   const { sut, validationStub } = makeSut() 
  //   jest.spyOn( validationStub, "validate").mockReturnValueOnce(new MissingParamError('any_field'))
  //   const httpResponse = await sut.handle(makeFakeRequest()) 
  //   expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  // })
})