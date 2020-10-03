'use strict'

const { validate } = use('Validator')

const User = use('App/Models/User')
const Bill = use('App/Models/Bill')

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

        const user = auth.getUser()

        if(!Array.isArray(participants)) {
            return response.status(400).json({ error: 'participants_not_array' })
        }

        const users = []

        for (let index = 0; index < participants.length; index++) {
            const userId = array[index];
            
            try {
                let userFound = User.findOrFail(userId)
                users.push(userFound)
            } catch (e) {
                return response.status(400).json({ error: 'no_user_found' })
            }
        }

        const bill = new Bill()
        user.bills().save(bill)
        const { validate } = use('Validator')
    }
}

module.exports = BillController