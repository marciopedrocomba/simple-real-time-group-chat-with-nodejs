class ImageLoadPlugin {
    constructor(img, input) {

        this.imgEl = document.querySelector(img)
        this.inputEl = document.querySelector(input)

        this.init()

    }

    init() {

        this.imgEl.addEventListener('click', e => {
            this.inputEl.click()
        })

        this.inputEl.addEventListener('change', e => {
            this.loadImage(e.target.files[0]).then(result => {

                this.imgEl.src = result

            }).catch(error => {
                console.error(error)
            })
        })

    }

    loadImage(file) {

        return new Promise((resolve, reject) => {

            const filereader = new FileReader()

            filereader.onload = () => {
                resolve(filereader.result)
            }

            filereader.onerror = error => {
                reject(error)
            }

            filereader.readAsDataURL(file)

        })

    }


}