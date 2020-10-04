'use strict'

const BankService = require('../Models/Banks/BankService')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Token {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {
    // call next to advance the request
    const {params, response, request, auth} = ctx
    const user = await auth.getUser()

    let bankAccount, bankAccounts
    if (params.bankId) {
      bankAccount = await user.bankAccounts().where('bank_id', params.bankId).first()
      if (!bankAccount) {
        return response.status(404).json({ error: 'no_bank_account_found' })
      }
      ctx.accessToken = bankAccount.access_token
    } else {
      bankAccounts = await user.bankAccounts().fetch()
    }

    if (bankAccounts) {
      for (const bankAcc of bankAccounts.rows) {
        this.updateBankAccount(user, bankAcc)
      }
    } else {
      const accessToken = this.updateBankAccount(user, bankAccount)
      if (accessToken) {
        ctx.accessToken = accessToken
      }
    }
    await next()
  }

  async updateBankAccount(user, bankAccount) {
    
    const updatedAt = bankAccount.updated_at
    const expiresIn = bankAccount.expires_in
    const updatedUnix = parseInt((new Date(updatedAt).getTime() / 1000).toFixed(0))
    const currentUnix = parseInt((new Date().getTime() / 1000).toFixed(0))
    const bankService = await new BankService(bankAccount.bank_id).setUser(user)
    const isWorking = await bankService.accessTokenCheck()

    if (updatedUnix + expiresIn < currentUnix || !isWorking)
    {
      const { access_token } = await bankService.refreshToken()
      return access_token
    }
  }
}

module.exports = Token
