class CameraController {

    constructor(video) {

        this._video = video

        this.initialize()

    }

    initialize() {

        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(stream => {

            this._stream = stream

            this._video.srcObject = stream

            this._video.play()

        }).catch(error => {

            console.log(error)

        })

    }

    stop() {
        this._stream.getTracks().forEach(track => {
            track.stop()
        })
    }

}