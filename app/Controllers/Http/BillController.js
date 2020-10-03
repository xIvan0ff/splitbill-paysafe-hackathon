'use strict'

const { validate } = use('Validator')

const User = use('App/Models/User')
const Bill = use('App/Models/Bill')
const BillUser = use('App/Models/BillUser')

const Database = use('Database')

class BillController {

    async create({request, auth, reponse}) {

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

        const users = []

        for (let index = 0; index < participants.length; index++) {
            const userId = array[index];
            
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
            await bill.billUsers().save(billUser)
        }

        await user.bills().save(bill)

        return bill
    }

    async read({auth}) {
        const user = await auth.getUser()
        const billIds = await Database.from('bill_users').where('user_id', user.id).pluck('id')
        const allBills = await Bill.query().whereIn('id', billIds)
        const completedBills =  allBills.where('completed', 1).fetch()
        const activeBills = allBills.where('completed', 0).fetch()

        return {completedBills, activeBills}
    }

    async addTransaction({request, response, auth}) {
        const user = await auth.getUser()


    }
}

module.exports = BillController