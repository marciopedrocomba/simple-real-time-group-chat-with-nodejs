class AppController {
    constructor() {

        this.sendMessageBtnEl = document.querySelector('.input-group-append .send_btn')
        this.openCameraBtnEl = document.querySelector('.input-group-append .open_photo')
        this.messageCardEl = document.querySelector('.msg_card_body')

        this.user = document.querySelector('[name=message-user]').value.trim()
        this.photo = document.querySelector('[name=message-photo]').value
        this.messageEl = document.querySelector('[name=message-content]')

        this.audio = new Audio('/sounds/accomplished-579.ogg')
        this.captureAudio = new Audio('/sounds/camera-shutter-click-01.wav')

        this.cameraModal = document.getElementById('camera-modal')
        this.viewPhotoModal = document.getElementById('view-image-modal')
        this.allImages = [...document.querySelectorAll('.sent-photo')]

        this.userProfileBtnEl = document.querySelector('.user_img')
        this.profileModalEl = document.getElementById('edit-profile-modal')

        this.microphoneTimerEl = document.querySelector('.microphone_timer')
        this.openMicroPhoneEl = document.querySelector('.open_microphone')
        this.closeMicroPhoneEl = document.querySelector('.close_microphone')

        this.autoCount = 0 //variable used to track the auto scroll on message parent

        this.initialize()

    }

    initialize() {

        this.messageCardEl.scrollTop = this.messageCardEl.scrollHeight

        this.sendMessageBtnEl.addEventListener('click', e => {

            let classArray = [...this.sendMessageBtnEl.classList]
            
            if(!(classArray.indexOf('send_audio') > - 1)) {

                const message = this.messageEl.value

                if(!message) {
                    alert("Please enter a message!")
                    return
                }

                this.sendMessage('/message')

            }else { 

                this.stopRecording()
                this.microphoneController.listeners.stoppedRecording = (file) => {
                    this.sendFile(file)
                }

            }


        })
        
        this.openCameraBtnEl.addEventListener('click', e => {
            this.video = this.cameraModal.querySelector('video')
            this.cameraController = new CameraController(this.video)
            this.toggleSendAndCaptureBtns()
            this.cameraModal.style.display = 'block'
        })

        this.cameraModal.querySelector('.close').addEventListener('click', e => {
            // the capture photo modal
            this.closeCaptureModal()
        })

        this.cameraModal.querySelector('.btn-capture-photo').addEventListener('click', e => {

            this.cameraModal.querySelector('video').style.display = 'none'
            this.toggleSendAndCaptureBtns(false)

            const imageEl = this.cameraModal.querySelector('img')
            const dataURL = this.capturePhoto()

            this.captureAudio.play()

            this.cameraController.stop()

            imageEl.src = dataURL
            
            imageEl.style.display = 'block'
        })

        this.cameraModal.querySelector('.btn-send-photo').addEventListener('click', e => {

            const imageURL = this.cameraModal.querySelector('img').src

            const blob = this.dataURItoBlob(imageURL)

            const file = new File([blob], `photo-${Date.now()}.png`, {
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

                        this.sendMessage('/message')
                    }
                        
                    break

            }

        })

        this.allImages.forEach(image => {

            this.addImageClickEvent(image)

        })

        this.userProfileBtnEl.addEventListener('click', e => {

            this.profileModalEl.style.display = 'block'

        })

        this.profileModalEl.querySelector('.close').addEventListener('click', e => {

            this.profileModalEl.style.display = 'none'

        })

        this.viewPhotoModal.querySelector('.close').addEventListener('click', e => {

            this.viewPhotoModal.style.display = 'none'

        })

        this.openMicroPhoneEl.addEventListener('click', e => {

            this.sendMessageBtnEl.classList.add('send_audio')

            this.microphoneController = new MicrophoneController()

            this.toggleMicrophoneControllers()

            const recordTimeStart = Date.now()

            this.startRecordTimerFormatting(recordTimeStart)


        })

        this.closeMicroPhoneEl.addEventListener('click', e => {

            this.stopRecording()

        })

        this.socket = io()

        this.socket.on('new message', data => {

            this.autoDetectScrollOnNewMessage()

            if(data.user == this.user) {

                const div = this.createElement('div', {

                    innerHTML: `

                        <div class="msg_cotainer_send">
                            ${data.message}
                            <span class="msg_time_send">now</span>

                        </div>
                        <div class="img_cont_msg">
                            <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
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
                            <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
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
            
            this.autoDetectScrollOnNewMessage()

        })

        this.socket.on('new message file', data => {

            this.autoDetectScrollOnNewMessage()

            if(data.type == 'image/png') {

                const imageEl = this.createElement('img', {}, element => {
                    element.classList.add('sent-photo')
                })
    
                imageEl.src = `/uploads/${data.message}`
    
                this.addImageClickEvent(imageEl)
    
                if(data.user == this.user) {
    
                    const msgContainer = this.createElement('div', {
                        innerHTML: `
                            <span class="msg_time_send">now</span>
                        `
                    }, element => {
    
                        element.classList.add('msg_cotainer_send')
    
                    })
    
                    const div = this.createElement('div', {
    
                        innerHTML: `
                            <div class="img_cont_msg">
                                <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
                            </div>
                        `
    
                    }, element => {
    
                        element.classList.add('d-flex', 'justify-content-end', 'mb-4')
                    })
    
    
                    msgContainer.prepend(imageEl)
    
                    div.prepend(msgContainer)
    
                    this.messageCardEl.appendChild(div)
    
                }else {
    
                    const msgContainer = this.createElement('div', {
                        innerHTML: `
                            <span class="msg_time_send">now</span>
                        `
                    }, element => {
    
                        element.classList.add('msg_cotainer')
    
                    })
    
                    const div = this.createElement('div', {
    
                        innerHTML: `
                            <div class="img_cont_msg">
                                <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
                            </div>
                        `
    
                    }, element => {
    
                        element.classList.add('d-flex', 'justify-content-start', 'mb-4')
                    })
    
                    msgContainer.prepend(imageEl)
    
                    div.append(msgContainer)
    
                    this.messageCardEl.appendChild(div)
    
                    this.playAudio()
    
                }

            }else if(data.type == 'audio/webm') {

                if(data.user == this.user) {

                    const div = this.createElement('div', {
    
                        innerHTML: `
    
                            <div class="msg_cotainer_send">
                                <audio controls>
                                    <source src="/uploads/${data.message}" type="${data.type}">
                                </audio>
                                <span class="msg_time_send">now</span>
    
                            </div>
                            <div class="img_cont_msg">
                                <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
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
                                <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
                            </div>
    
                            <div class="msg_cotainer">
                                <audio controls>
                                    <source src="/uploads/${data.message}" type="${data.type}">
                                </audio>
                                <span class="msg_time_send">now</span>
                            </div>
    
                        `
    
                    }, element => {
    
                        element.classList.add('d-flex', 'justify-content-start', 'mb-4')
                    })
    
                    this.messageCardEl.appendChild(div)
    
                    this.playAudio()
    
                }

            }

            //update the messages statistics
            this.updateMessageCount()
            this.autoDetectScrollOnNewMessage()

        })

        this.socket.on('new user', data => {

            this.autoDetectScrollOnNewMessage()

            const div = this.createElement('div', {

                innerHTML: `

                    <div class="img_cont_msg">
                        <img src="/uploads/${data.photo}" class="rounded-circle user_img_msg">
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
            this.autoDetectScrollOnNewMessage()

        })

    }


    autoDetectScrollOnNewMessage() {

        let scrollTop = this.messageCardEl.scrollTop
        let scrollHeight = this.messageCardEl.scrollHeight
        let scrollOffsetHeight = this.messageCardEl.offsetHeight

        let auto = (scrollTop >= (scrollHeight - scrollOffsetHeight))

        if(auto) {
            
            this.autoCount = 1
            this.messageCardEl.scrollTop = ((scrollHeight - scrollOffsetHeight))

        }else {

            if(this.autoCount > 0) {
                this.messageCardEl.scrollTop = ((scrollHeight - scrollOffsetHeight))
                this.autoCount = 0
            }else {
                this.messageCardEl.scrollTop = this.messageCardEl.scrollTop
            }

        }


    }


    stopRecording() {

        this.toggleMicrophoneControllers(false)
        this.microphoneController.stopRecord()
        this.stopRecordTimerFormatting()
        this.sendMessageBtnEl.classList.remove('send_audio')

    }

    startRecordTimerFormatting(timestart) {

        this.recordMicroPhoneTimer = setInterval(() => {

            this.microphoneTimerEl.querySelector('div').innerHTML = Format.formatTime(Date.now() - timestart)

        }, 1000)

    }

    stopRecordTimerFormatting() {

        clearInterval(this.recordMicroPhoneTimer)
        this.microphoneTimerEl.querySelector('div').innerHTML = '00:00'

    }

    toggleMicrophoneControllers(state = true) {

        if(state) {
            this.openMicroPhoneEl.style.display = 'none'
            this.closeMicroPhoneEl.style.display = 'flex'
            this.microphoneTimerEl.style.display = 'flex'
        }else {
            this.openMicroPhoneEl.style.display = 'flex'
            this.closeMicroPhoneEl.style.display = 'none'
            this.microphoneTimerEl.style.cssText = "display: none !important;border-radius: 0px !important;"
        }

    }

    addImageClickEvent(image) {

        image.addEventListener('click', e => {

            this.viewPhotoModal.style.display = 'block'
            this.viewPhotoModal.querySelector('img').src = image.src

        })

    }

    closeCaptureModal() {

        this.cameraModal.style.display = 'none'
        this.cameraModal.querySelector('video').style.display = 'block'
        this.cameraModal.querySelector('img').style.display = 'none'
        this.cameraController.stop()

    }

    sendFile(file) {

        const formadata = new FormData()

        formadata.append('upload_photo', file)
        formadata.append('user', this.user)
        formadata.append('photo', this.photo)

        const options = {
            method: "POST",
            body: formadata
        }

        this.sendMessage('/file-upload', options, {
            onSuccess: (json) => {
                // do close the capture modal
                this.closeCaptureModal()
            }
        })

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

    createElement(element, options = {}, callback = function() {}) {

        const el = document.createElement(element)

        for(const name in options) {

            el[name] = options[name]

        }

        callback(el)

        return el

    }

    sendMessage(url, options = {
        method: "POST",
        body: JSON.stringify({
            user: this.user,
            message: this.messageEl.value,
            photo: this.photo
        }),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }, config = {
        onSuccess: function() {
            document.querySelector('[name=message-content]').value = ''
        }
    }) {

        const request = new Request(url, options)

        fetch(request).then(response => {

            response.json().then(json => {

                if(json.error) {

                    alert(json.error)

                }else if(json.success) {

                    if(typeof config.onSuccess == 'function') {
                        config.onSuccess(json)
                    }

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