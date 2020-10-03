const uuidv4 = require('uuid/v4')
const axios = require('axios')
const https = require('https')
const fs = require('fs')
// Bank Services
const DskService = require('./DskService')
const FibankService = require('./FibankService')

const services = {
    dsk: DskService,
    fibank: FibankService
}

class BankService {

    constructor(bankId) {
        this.bank = new services[bankId]()

        this.agent = new https.Agent({
            pfx: fs.readFileSync('resources/certificates/' + this.bankId + '.pfx'),
            passphrase: '1234'
        });
    }

    // Setting the current user we're working with.

    async setUser(user) {
        this.user = user
        this.bankApi = axios.create({
            headers: {
                'X-Request-Id': uuidv4(),
                'X-IBM-Client-ID': this.bank.clientId,
                'Authorization': 'Bearer ' + await user.accessToken(this.bank.bankId)
            },
            httpsAgent: this.agent
        })
        return this
    }

    
    // Open Banking API 

    async getAccounts() {
        const _url = this.bank.apiUrl + 'accounts'
        const accounts = (await this.bankApi.get(_url)).data.accounts
        const transactionsArr = []
        for (const account of accounts) {
            const { iban } = account
            const { transactions } = await this.getTransactions(iban)
            for (const transaction of transactions.booked) {
                transactionsArr.push(transaction)
            }
        }
        console.log(transactionsArr)
        return transactionsArr 
    }

    async accessTokenCheck() {
        const _url = this.bank.apiUrl + 'accounts'

        try {
            return ((await this.bankApi.get(_url)).status == 200)
        } catch {
            return false
        }
    }

    async getBalances(iban) {
        const _url = this.bank.apiUrl + 'accounts/' + iban + '/balances'

        return await this.makeAccountRequest(_url)
    }

    async getTransactions(iban) {
        const _url = this.bank.apiUrl + 'accounts/' + iban + '/transactions'

        return await this.makeAccountRequest(_url)
    }


    async makeAccountRequest(url) {

        let date = new Date()
        date.setMonth(date.getMonth() - 1)
        let d = date.toISOString().slice(0, 10)

        const params = {
            'dateFrom': d,
            'bookingStatus': 'both'
        }

        return (await this.bankApi.get(url, { params })).data
    }

    // Authentication process.

    async startAuth() {
        return await this.bank.startAuth(this.user)
    }

    async finishAuth({state, code}) {
        return await this.bank.finishAuth({state, code})
    }

    async refreshToken() {
        return await this.bank.refreshToken(this.user)
    }

}

module.exports = BankService