const conn = require('./db')

module.exports = {

    save(params) {

        return new Promise((resolve, reject) => {

            conn.query(`insert into messages(who, content, date, time) values(?, ?, ?, ?)`,
            [

                params.who,
                params.content,
                params.date,
                params.time

            ], (err, results) => {

                if(err) reject(err)
                else resolve(results)

            })

        })

    }

}