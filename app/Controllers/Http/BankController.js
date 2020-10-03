'use strict'

const BankService = require('../../Models/Banks/BankService')

const CustomSocket = require('../../../socket/socket')

class BankController {

    async authenticate({auth, params}) {
        const user = await auth.getUser()
        const bankService = await new BankService(params.bankId).setUser(user)
        return await bankService.startAuth()
    }

    async success({request, params}) {
        const {state, code} = request.all()
        const bankService = await new BankService(params.bankId)
        const user = await bankService.finishAuth({state, code})

        CustomSocket.emit('bank', {
            type: 'authenticated'
        })

        return user
    }

    async refresh({accessToken}) {
        return {accessToken}
    }

    async getAccounts({auth, params}) {
        const user = await auth.getUser()
        const bankService = await new BankService(params.bankId).setUser(user)
        return await bankService.getAccounts()
    }
}

module.exports = BankController
