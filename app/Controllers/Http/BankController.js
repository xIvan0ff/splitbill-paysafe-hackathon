'use strict'

const BankService = require('../../Models/Banks/BankService')

const CustomSocket = require('../../../socket/socket')

const Transaction = use('App/Models/Transaction')

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
        try {
            CustomSocket.emit('bank', {
                type: 'authenticated'
            })
        } catch (e) { }

        return user
    }

    async refresh({accessToken}) {
        return {accessToken}
    }

    async getAccounts({auth, params}) {
        const user = await auth.getUser()
        const bankService = await new BankService(params.bankId).setUser(user)
        const transactions = await bankService.getAccounts()
        
        for (const iban in transactions) {
            for (const transactionInfo of transactions[iban]) {
                if(!transactionInfo.debtorName) {
                    continue
                }
                const trans = await Transaction.findOrCreate({
                    'iban': iban,
                    'debtor_iban': transactionInfo.debtorAccount.iban,
                    'debtor': transactionInfo.debtorName,
                    'amount': parseFloat(transactionInfo.transactionAmount.amount),
                    'description': transactionInfo.remittanceInformationUnstructured
                })
                user.transactions().save(trans)
            }
        }

        return transactions
    }
}

module.exports = BankController
