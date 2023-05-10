/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/space-before-blocks */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/quotes */
import { HttpResponse, HttpRequest, EmailValidator, Controller, AddAccount } from "./signup-protocols"
import { MissingParamError, ServerError, InvalidParamError } from "../../errors"
import { badRequest, serverError, ok } from "../../helpers/http-helper"

export class SignUpController {
  private readonly emailValidator: EmailValidator
  private readonly addAccount: AddAccount

  constructor (emailValidator: EmailValidator, addAccount: AddAccount) {
    this.emailValidator = emailValidator
    this.addAccount = addAccount
  }

  async handle( httpRequest: HttpRequest): Promise<HttpResponse> {
    try{
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body
      if ( password !== passwordConfirmation){
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }
      const isValid = this.emailValidator.isValid(email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }
     const account = await this.addAccount.add({
        name,
        email,
        password,
      })
      return ok(account)
    }
      catch (error) {
       return  serverError()
    }  
  }
}