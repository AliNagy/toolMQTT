new Vue(
    {
        el: '#app',
        data: function () {
            return ({
                notifySnackbar: {
                    msg: null,
                    color: null,
                    visibility: false
                },
                client: null,
                connected: false,
                request: {
                    host: 'test.mosquitto.org',
                    port: 8080,
                    client: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
                    user: null,
                    pass: null,
                    keepalive: 60,
                    clean: true,
                    lastwill: {
                        topic: null,
                        qos: "0",
                        retain: false,
                        msg: null
                    }
                },
                qosValues: ["0", "1", "2"],
            })
        },
        methods: {
            attemptConnection: function () {
                if (this.connected) {
                    if (this.client) {
                        this.client.end(false, () => {
                            this.snackbarState("Disconnected!", "info")
                        })
                    }
                } else {
                    const uri = "mqtt://" + this.request.host + ":" + this.request.port
                    const options = {
                        clientId: this.request.client,
                        username: this.request.user,
                        password: this.request.pass,
                        keepalive: Number(this.request.keepalive),
                        clean: this.request.clean
                    }
                    if (this.request.lastwill.msg && this.request.lastwill.topic) {
                        options.will = {
                            topic: this.request.lastwill.topic,
                            qos: Number(this.request.lastwill.qos),
                            retain: this.request.lastwill.retain,
                            payload: this.request.lastwill.msg
                        }
                    }
                    this.client = mqtt.connect(uri, options)
                    this.registerEvents()
                }
            },
            registerEvents: function () {
                this.client.on('connect', () => {
                    this.snackbarState("Connected!", "success")
                    this.connected = true
                })
                this.client.on('end', () => {
                    this.connected = false
                })
                this.client.on('error', (err) => {
                    this.snackbarState("Error!", "error")
                    this.client.end()
                })
            },
            snackbarState: function (msg, color, state) {
                this.notifySnackbar.msg = msg
                this.notifySnackbar.color = color
                this.notifySnackbar.visibility = true
                setTimeout(() => { this.notifySnackbar.visibility = false }, 2000)
            }
        },
        computed: {
            isConnected: function () {
                if (this.connected) return true
                else return false
            }
        }
    }
)

