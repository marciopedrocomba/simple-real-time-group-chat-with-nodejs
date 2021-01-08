const conn = require('./db')

module.exports = {

    save(params) {

        return new Promise((resolve, reject) => {

            let sql = "", values = [
                params.who,
                params.content || params.photo,
                params.date,
                params.time
            ]

            if(params.photo) {

                sql = `insert into messages(who, content, date, time, type) values(?, ?, ?, ?, ?)`
                values.push(params.type)

            }else {

                sql = `insert into messages(who, content, date, time) values(?, ?, ?, ?)`

            }

            conn.query(sql, values, (err, results) => {

                if(err) reject(err)
                else resolve(results)

            })

        })

    }

}