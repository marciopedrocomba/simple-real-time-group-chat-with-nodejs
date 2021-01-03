class AppController {
    constructor() {

        this.sendMessageBtnEl = document.querySelector('.input-group-append')
        this.messageCardEl = document.querySelector('.msg_card_body')

        this.user = document.querySelector('[name=message-user]').value
        this.photo = document.querySelector('[name=message-photo]').value
        this.messageEl = document.querySelector('[name=message-content]')

        this.audio = new Audio('/sounds/accomplished-579.ogg')

        this.initialize()

    }

    initialize() {

        this.sendMessageBtnEl.addEventListener('click', e => {

            const message = this.messageEl.value

            if(!message) {
                alert("Please enter a message!")
                return
            }

            this.sendMessage(this.user.trim(), message, this.photo)

        })
        

        this.messageEl.addEventListener('keyup', e => {

            const message = this.messageEl.value

            switch(e.key) {
                case 'Enter':
                    if(!e.shiftKey) {
                        if(!message) {
                            alert("Please enter a message!")
                            return
                        }

                        this.sendMessage(this.user.trim(), message, this.photo)
                    }
                        
                    break

            }

        })

        this.socket = io()

        this.socket.on('new message', data => {


            if(data.user == this.user) {

                const div = this.createElement('div', {

                    innerHTML: `

                        <div class="msg_cotainer_send">
                            ${data.message}
                            <span class="msg_time_send">now</span>

                        </div>
                        <div class="img_cont_msg">
                            <img src="/img/${data.photo}" class="rounded-circle user_img_msg">
                        </div>

                    `

                }, element => {

                    element.classList.add('d-flex', 'justify-content-end', 'mb-4')
                })

                this.messageCardEl.appendChild(div)

            }else {

                const div = this.createElement('div', {

                    innerHTML: `

                        <div class="img_cont_msg">
                            <img src="/img/${data.photo}" class="rounded-circle user_img_msg">
                        </div>

                        <div class="msg_cotainer">
                            ${data.message}
                            <span class="msg_time_send">now</span>
                        </div>

                    `

                }, element => {

                    element.classList.add('d-flex', 'justify-content-start', 'mb-4')
                })

                this.messageCardEl.appendChild(div)

                this.playAudio()

            }

            //update the messages statistics
            this.updateMessageCount()
            

        })

        this.socket.on('new user', data => {

            const div = this.createElement('div', {

                innerHTML: `

                    <div class="img_cont_msg">
                        <img src="/img/${data.photo}" class="rounded-circle user_img_msg">
                    </div>

                    <div class="msg_cotainer">
                        New User ${data.email}
                    </div>

                `

            }, element => {

                element.classList.add('d-flex', 'justify-content-center', 'mb-4')
            })

            this.messageCardEl.appendChild(div)

            this.playAudio()

        })

    }

    updateMessageCount() {
        let total = parseInt(document.querySelector('.message-total').innerHTML)
        document.querySelector('.message-total').innerHTML = total+1
    }

    playAudio() {
        this.audio.currentTime = 0
        this.audio.play()
    }

    createElement(element, options, callback) {

        const el = document.createElement(element)

        for(const name in options) {

            el[name] = options[name]

        }

        callback(el)

        return el

    }

    sendMessage(user, message, photo) {

        const body = {
            user,
            message,
            photo
        }

        const request = new Request('/message', {
            method: "POST",
            body: JSON.stringify(body),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })

        fetch(request).then(response => {

            response.json().then(json => {

                if(json.error) {

                    alert(json.error)

                }else if(json.success) {


                    document.querySelector('[name=message-content]').value = ''

                }

            }).catch(error => {

                console.log(error)

            })

        }).catch(error => {

            console.log(error)

        })

    }
}

new AppController()