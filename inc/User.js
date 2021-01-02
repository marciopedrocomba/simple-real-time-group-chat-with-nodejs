const conn = require('./db')
const path = require('path')
const bcrypt = require('bcrypt')

module.exports = {

    validateUserExists(username, email) {

        return new Promise(async (resolve, reject) => {

            try {

                conn.query(`select * from users where username = ? or email = ?`, 
                [
                    username,
                    email
                ], (err, results) => {

                    if(err) reject(err)
                    else {
                        if(results[0]) resolve(results[0])
                        else resolve({})
                    }

                })
                
            } catch (error) {
                
                reject(error)

            }

        })

    },

    save(params) {

        return new Promise(async (resolve, reject) => {

            try {

                params.password = await bcrypt.hash(params.password, 10)

                let query, values = [
                    params.username,
                    params.email,
                    params.password
                ];

                if(params.photo) {

                    params.photo = path.parse(params.photo).base
                    query = `insert into users(username, email, password, photo) values(?, ?, ?, ?)`
                    values.push(params.photo)

                }else {

                    query = `insert into users(username, email, password) values(?, ?, ?)`

                }

                conn.query(query, values, (err, results) => {

                    if(err) reject(err)
                    else resolve(results)
                })
                
            } catch (error) {
                
                reject(error)

            }

        })

    }, 

    login(email, password) {

        return new Promise(async (resolve, reject) => {

            try {

                const userExists = await this.validateUserExists(email, email)

                if(!userExists.email) {

                    resolve({
                        error: "User does not exist"
                    })

                }else {

                    const matched = await bcrypt.compare(password, userExists.password)

                    if(!matched) {

                        resolve({
                            error: "Email or password wrong"
                        })

                    }else {

                        resolve({
                            id: userExists.id,
                            username: userExists.username,
                            email: userExists.email,
                            photo: userExists.photo
                        })

                    }

                }
                
            } catch (error) {
                
                reject(error)

            }

        })

    }

}