new Vue(
    {
        el: '#app',
        data: function () {
            return ({
                notifySnackbar: {//This controls the snackbar message
                    msg: null,
                    color: null,
                    visibility: false
                },
                client: null,//Contains the MQTT client
                connected: false,
                request: {//Connection object
                    host: 'mqtt://test.mosquitto.org:8080',
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
                dataContainer: {//Contains all messages/subscriptions
                    subscriptions: [],
                    messages: []
                },
                topic: {
                    topic: "test/#",
                    qos: "0"
                },
                publish: {
                    topic: "test/1",
                    qos: "0",
                    retain: false,
                    msg: ""
                },
                pagination: {
                    subscriptions: {},
                    messages: {}
                },
                headers: {
                    subscriptions: [
                        {
                            text: "Topic",
                            align: 'left',
                            sortable: false,
                            value: 'topic'
                        }, {
                            text: "QoS",
                            align: 'left',
                            value: "qos",
                            sortable: false
                        }, {
                            text: "Unsubscribe",
                            align: 'left',
                            sortable: false
                        }
                    ]
                }
            })
        },
        methods: {
            attemptConnection: function () {
                if (this.connected) {//Already connected? Must be disconnecting(same button, different looks!)
                    if (this.client) {
                        this.client.end(false, () => {
                            this.snackbarState("Disconnected!", "info")
                        })
                    }
                } else {
                    const uri = this.request.host//obtain the URI input 
                    const options = {
                        clientId: this.request.client,
                        username: this.request.user,
                        password: this.request.pass,
                        keepalive: Number(this.request.keepalive),
                        clean: this.request.clean
                    }//Reconstruct the options object to match requirement
                    if (this.request.lastwill.msg && this.request.lastwill.topic) {//Last will? Throw it in!
                        options.will = {
                            topic: this.request.lastwill.topic,
                            qos: Number(this.request.lastwill.qos),
                            retain: this.request.lastwill.retain,
                            payload: this.request.lastwill.msg
                        }
                    }
                    this.client = mqtt.connect(uri, options)//Lets connect.
                    this.registerEvents()
                }
            },
            addTopic: function () {//Function of the add topic button
                if (this.topic.topic == "") {
                    this.snackbarState("Please add the topic!", "info")//Empty? Stop.
                    return
                }
                this.client.subscribe(this.topic.topic, { qos: Number(this.topic.qos) }, (err, granted) => {
                    if (err) {
                        this.snackbarState("Failed to subscribe!", "error")
                    } else if (granted) {
                        this.snackbarState("Subscribed to " + this.topic.topic, "info")
                    }
                })
                var item = Object.assign({}, this.topic)
                this.dataContainer.subscriptions.push(item)//Throw that topic into the subscriptions container
            },
            publishMsg: function () {//Function of the publish message button
                if (this.publish.topic == "" || this.publish.msg == "") {//You need a topic and a message!
                    this.snackbarState("Please add the topic and message!", "info")
                    return
                }
                const options = {
                    qos: Number(this.publish.qos),
                    retain: this.publish.retain,
                }
                this.client.publish(this.publish.topic, this.publish.msg, options, (err) => {
                    if (err) {
                        console.log(err)
                        this.snackbarState("Failed to publish!", "error")
                    } else {
                        this.snackbarState("Successfully published!", "info")
                    }
                })

            },
            deleteItem: function (item) {//Deleting a subscribed item
                const index = this.dataContainer.subscriptions.indexOf(item)
                confirm('Are you sure you wish to unsubscribe from this topic?') && this.dataContainer.subscriptions.splice(index, 1)
                this.client.unsubscribe(item.topic, (err) => {
                    if (err) {
                        this.snackbarState("Failed to unsubscribe!", "error")
                    } else {
                        this.snackbarState("Unsubscribed from " + item.topic, "info")
                        for (var _index in this.dataContainer.messages) {//This is to remove all 'child' messages of the subscription
                            if (parser.isParent(this.dataContainer.messages[_index].topic, item.topic)) {
                                this.dataContainer.messages.splice(_index, 1)
                            }
                        }
                    }
                })
            },
            registerEvents: function () {//Register the events for the client everytime it connects
                this.client.on('connect', () => {
                    this.snackbarState("Connected!", "success")
                    this.connected = true
                })
                this.client.on('end', () => {
                    this.connected = false
                    this.dataContainer.subscriptions = []
                    this.dataContainer.messages = []
                })
                this.client.on('error', (err) => {
                    this.snackbarState("Error!", "error")
                    this.client.end()
                })
                this.client.on('message', (topic, message, packet) => {//A new message obtained? Push it in!
                    this.dataContainer.messages.push({ topic: topic, msg: String(message), qos: packet.qos, retain: packet.retain })
                })
            },
            snackbarState: function (msg, color) {//Just controls the snackbar
                this.notifySnackbar.msg = msg
                this.notifySnackbar.color = color
                this.notifySnackbar.visibility = true
                setTimeout(() => { this.notifySnackbar.visibility = false }, 2000)
            }
        },
        computed: {
            subPages() {
                if (this.pagination.subscriptions.rowsPerPage == null ||
                    this.pagination.subscriptions.totalItems == null
                ) return 0
                return Math.ceil(this.pagination.subscriptions.totalItems / this.pagination.subscriptions.rowsPerPage)
            },
            isConnected: function () {
                if (this.connected) return true
                else return false
            }
        }
    }
)

