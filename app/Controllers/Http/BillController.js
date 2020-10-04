'use strict'

const { all } = require("../../Models/Bill")

const { validate } = use('Validator')

const User = use('App/Models/User')
const Bill = use('App/Models/Bill')
const BillUser = use('App/Models/BillUser')
const Transaction = use('App/Models/Transaction')
const BillTransaction = use('App/Models/BillTransaction')

const Database = use('Database')

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
        bill.amount = 69.69 // placeholder
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
        } catch (error) {
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
            const trans = transObj.transaction().fetch()
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

    async addTransaction({request, response, auth}) {
        const user = await auth.getUser()

        const rules = {
            billId: 'required|numeric',
            transactionId: 'required|numeric'
        }

        const { billId, transactionId } = request.all()

        
        const validation = await validate(request.all(), rules)

        if (validation.fails()) {
            return validation.messages()
        }

        let bill, transaction

        try {
            bill = await Bill().find(billId)
        } catch (e) {
            return response.status(404).json({ error: "no_bill_found" })
        }
        try {
            transaction = await Transaction.find(transactionId)
        } catch(e) {
            return response.json({ error: "no_transaction_found" })
        }

        const billTransaction = new BillTransaction()
        billTransaction.transaction_id = transaction.id
        billTransaction.userId = user.id

        await bill.transactions().save(billTransaction)
    }
}

module.exports = BillController