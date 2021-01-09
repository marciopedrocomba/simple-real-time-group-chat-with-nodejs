class MicrophoneController {

    constructor() {

        this.listeners = {}
        this.type = 'audio/webm'
        this.askUserToStartRecording()
        
    }

    async askUserToStartRecording() {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            this._stream = stream

            this.mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this.type
            })

            let chunks = []

            this.mediaRecorder.addEventListener('dataavailable', e => {

                if(e.data.size > 0) chunks.push(e.data)

            })

            this.mediaRecorder.addEventListener('stop', e => {

                const blob = new Blob(chunks, {
                    type: this.type
                })

                let filename = `rec${Date.now()}.webm`

                const file = new File([blob], filename, {
                    type: this.type,
                    lastModified: Date.now()
                })

                this.apply('stoppedRecording', [file])

            })
            
            this.mediaRecorder.start()

            
        } catch (error) {
            
            console.log(error)

        }

    }

    apply(name, args) {

        if(typeof this.listeners[name] == 'function') {
            this.listeners[name].apply(null, args)
        }
    }

    stopRecord() {

        this._stream.getTracks().forEach(track => {

            track.stop()

        })

        this.mediaRecorder.stop()

    }

}