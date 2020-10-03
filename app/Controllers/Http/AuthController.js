'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class AuthController {

    async register({request, auth, response}) {
        const { email } = request.all()

        const emailCheck = await User.findBy('email', email)

        if (emailCheck) {
            return response.status(400).json({ error: 'account_exists' })
        }

        let user = await User.create(request.all())
        const token = await auth.generate(user)
        Object.assign(user, token)
        return response.json(user)
    } 

    async login({request, auth, response}) {
        const { email, password } = request.all()

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

    async users({auth}) {
        const user = await auth.getUser()
        return {user}
    }

    async search({auth, request}) {
        const user = await auth.getUser()
        const {search} = request.all()
        const found = await User.query().whereNot('id', user.id).where(function () {
            this.where('email', 'LIKE', `%${search}%`).orWhere('name', 'LIKE', `%${search}%`)
        }).fetch()
        
        return found
    }
}

module.exports = AuthController