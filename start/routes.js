'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')

// Authentication
Route.group(() => { 
    Route.post('/login', 'AuthController.login').middleware('guest')
    Route.post('/login/token', 'AuthController.loginToken').middleware('auth')
    Route.post('/register', 'AuthController.register').middleware('guest')
    Route.post('/password/update', 'AuthController.changePassword').middleware('auth')
    Route.get('/', 'AuthController.users').middleware('auth')
    Route.get('/search', 'AuthController.search').middleware('auth')
}).prefix('/auth')
