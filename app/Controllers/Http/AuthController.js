'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')
const { validate } = use('Validator')

class AuthController {

    async register({request, auth, response}) {
    
        const rules = {
            email: 'required|email|unique:users,email',
            password: 'required'
        }

        const validation = await validate(request.all(), rules)

        if (validation.fails()) {
            return validation.messages()
        }

        let user = await User.create(request.all())
        
        const token = await auth.generate(user)
        Object.assign(user, token)
        
        return response.json(user)
    } 

    async login({request, auth, response}) {
        const { email, password } = request.all()

        const rules = {
            email: 'required|email',
            password: 'required'
        }

        const validation = await validate(request.all(), rules)

        if (validation.fails()) {
            return validation.messages()
        }

        try {
            if (await auth.attempt(email, password)) {
                let user = await User.findBy('email', email)
        
                const token = await auth.generate(user)
                Object.assign(user, token)
        
                return {user}
            }
        }
        catch (e) {
            return response.status(401).json({ error: 'no_account' })
        }
    }

    async loginToken({auth}) {
        const user = await auth.getUser()
        return {user}
    }
    
    async changePassword({auth, request, response}) {
        const { new_password, old_password } = request.all()
        
        const user = await auth.getUser()

        if (!new_password) {
            return response.status(400).json({ error: 'no_password' })
        }

        const verifyPassword = await Hash.verify(
            old_password,
            user.password
        )

        if (!verifyPassword) {
            return response.status(400).json({error: 'wrong_password'})
        }

        user.password = new_password
        user.save()
        
        return response.json({
            status: 'success',
            message: 'Password updated!'
        })
    }

    async search({auth, request}) {
        const user = await auth.getUser()
        const {search} = request.all()

        const found = await User.query().where('name', 'LIKE', `%${search}%`).whereNot('id', user.id).select('id', 'name').fetch()
        
        return found
    }
}

module.exports = AuthController