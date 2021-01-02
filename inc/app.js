const conn = require("./db")

module.exports = {

    getParams(params) {
        return Object.assign({}, {
            title: 'LetsTlk'
        }, params)
    },

    getAllMessages() {

        return new Promise((resolve, reject) => {

            conn.query(`select * from messages_view order by time asc`, (err, results) => {

                if(err) reject(err)
                else resolve(results)

            })

        })
    }

}