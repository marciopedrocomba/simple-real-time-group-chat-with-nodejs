class AppController {
    constructor() {

        this.sendMessageBtnEl = document.querySelector('.input-group-append .send_btn')
        this.openCameraBtnEl = document.querySelector('.input-group-append .open_photo')
        this.messageCardEl = document.querySelector('.msg_card_body')

        this.user = document.querySelector('[name=message-user]').value
        this.photo = document.querySelector('[name=message-photo]').value
        this.messageEl = document.querySelector('[name=message-content]')

        this.audio = new Audio('/sounds/accomplished-579.ogg')

        this.cameraModal = document.getElementById('camera-modal')

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
        
        this.openCameraBtnEl.addEventListener('click', e => {
            this.video = this.cameraModal.querySelector('video')
            this.cameraController = new CameraController(this.video)
            this.toggleSendAndCaptureBtns()
            this.cameraModal.style.display = 'block'
        })

        this.cameraModal.querySelector('.close').addEventListener('click', e => {
            this.cameraModal.style.display = 'none'
            this.cameraModal.querySelector('video').style.display = 'block'
            this.cameraModal.querySelector('img').style.display = 'none'
            this.cameraController.stop()
        })

        this.cameraModal.querySelector('.btn-capture-photo').addEventListener('click', e => {

            this.cameraModal.querySelector('video').style.display = 'none'
            this.toggleSendAndCaptureBtns(false)

            const imageEl = this.cameraModal.querySelector('img')
            const dataURL = this.capturePhoto()

            imageEl.src = dataURL
            
            imageEl.style.display = 'block'
        })

        this.cameraModal.querySelector('.btn-send-photo').addEventListener('click', e => {

            const imageURL = this.cameraModal.querySelector('img').src

            const blob = this.dataURItoBlob(imageURL)

            const file = new File([blob], `photo-${Date.now()}`, {
                type: 'image/png',
                lastModified: Date.now()
            })

            this.sendFile(file)

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

    sendFile(file) {

        console.log(file)

    }

    dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);
  
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);

        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
      }

    toggleSendAndCaptureBtns(status = true) {
        if(status) {

            this.cameraModal.querySelector('.btn-capture-photo').style.display = 'block'
            this.cameraModal.querySelector('.btn-send-photo').style.display = 'none'

        }else {

            this.cameraModal.querySelector('.btn-capture-photo').style.display = 'none'
            this.cameraModal.querySelector('.btn-send-photo').style.display = 'block'

        }
    }

    capturePhoto(type = 'image/png') {

        const canvas = document.createElement('canvas')

        canvas.width = 500
        canvas.height = 400

        const context = canvas.getContext('2d')

        context.drawImage(this.video, 0, 0, canvas.width, canvas.height)

        return canvas.toDataURL(type)

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