'use strict'

const BankService = require('../../Models/Banks/BankService')

const CustomSocket = require('../../../socket/socket')
const User = require('../../Models/User')

// const Transaction = use('App/Models/Transaction')

class BankController {

    async authenticate({auth, params}) {
        const user = await auth.getUser()
        const bankService = await new BankService(params.bankId).setUser(user)
        return await bankService.startAuth()
    }
    
    async success({request, params}) {
        const {state, code} = request.all()
        const bankService = await new BankService(params.bankId)
        await bankService.finishAuth({state, code})

        const user = await User.findBy('state', state)

        try {
            CustomSocket.emit(user.id, 'bank', {
                type: 'authenticated'
            })
        } catch (e) { console.log(e) }

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
