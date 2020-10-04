'use strict'

const { all } = require("../../Models/Bill")

const { validate } = use('Validator')

const User = use('App/Models/User')
const Bill = use('App/Models/Bill')
const BillUser = use('App/Models/BillUser')
const Transaction = use('App/Models/Transaction')
const BillTransaction = use('App/Models/BillTransaction')

const Database = use('Database')

const BankService = require('../../Models/Banks/BankService')

class BillController {

    async create({request, auth, response}) {

        const rules = {
            name: 'required',
            participants: 'required'
        }

        const validation = await validate(request.all(), rules)

        if (validation.fails()) {
            return validation.messages()
        }

        const { name, participants } = request.all()

        const user = await auth.getUser()

        if(!Array.isArray(participants)) {
            return response.status(400).json({ error: 'participants_not_array' })
        }

        const users = [user]
        
        for (let index = 0; index < participants.length; index++) {
            const userId = participants[index];
            
            try {
                let userFound = await User.findOrFail(userId)
                users.push(userFound)
            } catch (e) {
                return response.status(400).json({ error: 'no_user_found' })
            }
        }

        const bill = new Bill()
        bill.name = name
        bill.amount = 0
        bill.participants = users.length

        for (const userObj of users) {
            const billUser = new BillUser()
            billUser.user_id = userObj.id
            await bill.users().save(billUser)
        }

        await user.bills().save(bill)

        return bill
    }

    async read({auth}) {
        const user = await auth.getUser()
        const billIds = await Database.from('bill_users').where('user_id', user.id).pluck('bill_id')
        let activeBills = [], completedBills = []
        for (const billId of billIds) {
            const bill = await this.readBillInfo(user, billId)
            if (bill.completed) {
                completedBills.push(bill)
            } else {
                activeBills.push(bill)
            }
        }
        return {activeBills, completedBills}
    }

    async readBill({auth, params, response}) {
        const user = await auth.getUser()
        try {
            return await this.readBillInfo(user, params.billId)
        } catch (e) {
            console.log(e)
            return response.status(404).json({ error: "no_bill_found" })
        }
    }

    async readBillInfo(user, billId) {

        const bill = await user.bills().where('id', billId).first()

        const transactions = await bill.transactions().fetch()
        const users = await bill.users().fetch()

        let usersArr = []
        let transArr = []

        for (const userObj of users.rows) {
            usersArr.push(await userObj.user().select('id', 'name').fetch())
        }

        for (const transObj of transactions.rows) {
            const transUser = await User.find(transObj.user_id)
            const trans = await transObj.transaction().fetch()
            const transComplete = {
                ...trans.toJSON(),
                user: transUser
            }
            transArr.push(transComplete)
        }

        return {
            ...bill.toJSON(),
            users: usersArr,
            transactions: transArr
        }
    }

    async addTransaction({request, response, auth, params}) {
        const user = await auth.getUser()

        const rules = {
            billId: 'required',
            transactionId: 'required'
        }

        const { transactionId } = request.all()
        const { billId } = params
        
        const validation = await validate({billId, transactionId}, rules)

        if (validation.fails()) {
            return validation.messages()
        }

        let bill, transaction

        const billUser = await BillUser.findBy({'user_id': user.id, 'bill_id': billId})
        bill = await Bill.findBy({'id': billUser.bill_id, 'completed': 0})
        if (!bill) {
            return response.status(404).json({ error: "no_bill_found" })
        }
        transaction = await Transaction.find(transactionId)
        if (!transaction) {
            return response.status(404).json({ error: "no_transaction_found" })
        }
        const billTransaction = await BillTransaction.findOrCreate({'transaction_id': transaction.id, 'user_id': user.id})
        await bill.transactions().save(billTransaction)
        await bill.save()

        return response.json({ message: "done" })
    }


    async getTransactions({auth, params}) {
        const user = await auth.getUser()
        const transactions = await BankService.getAllTransactions(user)
        
        const { billId } = params

        const transactionsDb = {}

        for (const name in transactions) {
            transactionsDb[name] = []
            for (const transactionInfo of transactions[name]) {
                if(!transactionInfo.debtorName) {
                    continue
                }

                const trans = await Transaction.findOrCreate({
                    'iban': transactionInfo.iban,
                    'debtor_iban': transactionInfo.debtorAccount.iban,
                    'debtor': transactionInfo.debtorName,
                    'amount': parseFloat(transactionInfo.transactionAmount.amount),
                    'description': transactionInfo.remittanceInformationUnstructured,
                    'date': transactionInfo.bookingDate
                })
                user.transactions().save(trans)
                const billTrans = await BillTransaction.findBy({'bill_id': billId, 'transaction_id': trans.id})
                const transJson = trans.toJSON()
                transJson['bankId'] = transactionInfo.bankId
                if (!billTrans) {
                    transactionsDb[name].push(transJson)
                }
            }
        }
        return transactionsDb
    }


    async splitMoney({params, auth, response}) {

        const user = await auth.getUser()

        const { billId } = params

        const billUser = await BillUser.findBy({'bill_id': billId, 'user_id': user.id})

        if (!billUser) {
            return response.status(400).json({ error: "illegal_action" })
        }

        const bill = await Bill.find(billId)
        const billTransactions = await bill.transactions().fetch()
        const billUsers = await bill.users().fetch()
        
        const payedObj = { }        

        for (const billUser of billUsers.rows) {
            payedObj[billUser.user_id] = 0
        }

        for (const billTrans of billTransactions.rows) {
            const trans = await Transaction.find(billTrans.transaction_id)
            const userId = billTrans.user_id
            const amount = trans.amount
            payedObj[userId] += amount
        }

        const payedValues = Object.values(payedObj)
        const payedKeys = Object.keys(payedObj)

        const payed = []

        for (let index = 0; index < payedValues.length; index++) {
            const value = payedValues[index];
            const key = payedKeys[index];
            const pair = {id: key, amount: value}
            payed.push(pair)
        }
        
        let average = 0
        for (const user of payed) {
            average += user.amount
        }
        average /= payed.length
        
        const normalized = payed.map((el) => ({
            ...el,
            amount: el.amount - average,
        }))
        
        const owers = normalized
            .filter((el) => el.amount > 0)
            .sort(function (a, b) {
                return b.amount - a.amount
            })
        const getters = normalized
            .filter((el) => el.amount < 0)
            .sort(function (a, b) {
                return a.amount - b.amount
            })
        
        const transactions = []
        
        let currentReceiver = 0
        let currentGiver = 0
        
        let receiver = { ...owers[currentReceiver] }
        let giver = { ...getters[currentGiver] }
        
        while (currentReceiver !== owers.length && currentGiver !== getters.length) {
            if (Math.abs(giver.amount) >= receiver.amount) {
                giver.amount += receiver.amount
        
                transactions.push([giver.id, receiver.id, receiver.amount])
        
                receiver.amount = 0
            } else {
                receiver.amount += giver.amount
        
                transactions.push([giver.id, receiver.id, Math.abs(giver.amount)])
        
                giver.amount = 0
            }
        
            if (receiver.amount === 0) {
                receiver = { ...owers[++currentReceiver] }
            }
            if (giver.amount === 0) {
                giver = { ...getters[++currentGiver] }
            }
        }

        const transArr = []
        for (const transaction of transactions) {
            const userOwer = await User.find(transaction[0])
            const userOwsTo = await User.find(transaction[1])
            const obj = {
                ower: userOwer,
                owsTo: userOwsTo,
                amount: transaction[2]
            }

            transArr.push(obj)
        }
        return transArr
    }

}

module.exports = BillController