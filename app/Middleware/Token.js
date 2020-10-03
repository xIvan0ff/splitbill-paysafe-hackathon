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
    const bankAccount = await user.bankAccounts().where('bank_id', params.bankId).first()
    
    if (!bankAccount) {
      return response.status(404).json({ error: 'no_bank_account_found' })
    }

    ctx.accessToken = bankAccount.access_token

    const updatedAt = bankAccount.updated_at
    const expiresIn = bankAccount.expires_in
    const updatedUnix = parseInt((new Date(updatedAt).getTime() / 1000).toFixed(0))
    const currentUnix = parseInt((new Date().getTime() / 1000).toFixed(0))
    const bankService = await new BankService(params.bankId).setUser(user)
    const isWorking = await bankService.accessTokenCheck()

    if (updatedUnix + expiresIn < currentUnix || !isWorking)
    {
      const { access_token } = await bankService.refreshToken()
      ctx.accessToken = access_token
    }
  

    await next()
  }
}

module.exports = Token
