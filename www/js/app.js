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
                    client: null,
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
                        this.client.end(false)
                    }
                } else {
                    const uri = "mqtt://" + this.request.host + ":" + this.request.port
                    this.client = mqtt.connect(uri)
                    this.registerEvents()
                }
            },
            registerEvents: function () {
                this.client.on('connect', () => {
                    this.snackbarState("Successfully connected!", "success")
                    this.connected = true
                })
                this.client.on('end', () => {
                    this.snackbarState("Successfully disconnected!", "error")
                    this.connected = false
                })
            },
            snackbarState: function (msg, color, state) {
                this.notifySnackbar.msg = msg
                this.notifySnackbar.color = color
                this.notifySnackbar.visibility = true
                setTimeout(()=>{ this.notifySnackbar.visibility = false}, 1000)
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

