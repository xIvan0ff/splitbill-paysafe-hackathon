const uuidv4 = require('uuid/v4')
const buildUrl = require('build-url')
const Env = use('Env')
const User = use('App/Models/User')
const UserBankAccount = use('App/Models/UserBankAccount')
const axios = require('axios')
const https = require('https')
const fs = require('fs')
const qs = require('qs')
const path = require('path')


class DskService {
    bankId = 'dsk'
    oauthUrl = Env.get('DSK_OAUTH_URL') + 'authorize'
    tokenUrl = Env.get('DSK_OAUTH_URL') + 'token'
    apiUrl = Env.get('DSK_API_URL')
    redirectUri = Env.get('REDIRECT_URL') + 'bank/' + this.bankId + '/success'
    clientId = Env.get('DSK_CLIENT_ID')
    clientSecret = Env.get('DSK_CLIENT_SECRET')
    apiScope = Env.get('DSK_SCOPE')

    async startAuth(user) {
        const state = uuidv4()
        user.bank_oauth_state = state
        await user.save()
        return buildUrl(this.oauthUrl, {
            queryParams: {
                response_type: 'code',
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                scope: this.apiScope,
                state: state
            }
        })
    }

    async refreshToken(user) {
        const bankAccount = await user.bankAccounts().where('bank_id', this.bankId).first()
        return this.tokenRequest(user, true, bankAccount.refresh_token)
    }

    async finishAuth({state, code}) {
        const user = await User.findBy('bank_oauth_state', state)
        return this.tokenRequest(user, false, code)
    }

    async tokenRequest(user, refresh = false, codeToken = '') {
        let grant_type = 'authorization_code' 
        if (refresh)
        {
            grant_type = 'refresh_token'
        }
        
        const data = {
            grant_type: grant_type,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret
        }

        if (!refresh) { 
            data.code = codeToken
        } else {
            data.refresh_token = codeToken
        }

        const response = await axios({
            method: "POST",
            httpsAgent: new https.Agent({rejectUnauthorized: false}),
            url: this.tokenUrl,
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(data)
        })

        const respData = response.data
        const bankAccount = await UserBankAccount.findOrCreate({'bank_id': this.bankId, 'user_id': user.id})
        bankAccount.bank_id = this.bankId
        bankAccount.access_token = respData.access_token
        bankAccount.expires_in = respData.expires_in
        bankAccount.refresh_token = respData.refresh_token
        await user.bankAccounts().save(bankAccount)
        return respData
    }
}

module.exports = DskService