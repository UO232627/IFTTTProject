[
    {
        "id": "e8f4952174880a7d",
        "type": "tab",
        "label": "Flow 1",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "9c912bb500ceadf1",
        "type": "http request",
        "z": "e8f4952174880a7d",
        "name": "POST request",
        "method": "POST",
        "ret": "txt",
        "paytoqs": "ignore",
        "url": "https://raspy-flower-lungfish.glitch.me//ifttt/v1/triggers/temp_above",
        "tls": "",
        "persist": false,
        "proxy": "",
        "authType": "",
        "senderr": false,
        "headers": [
            {
                "keyType": "Content-Type",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "application/json"
            },
            {
                "keyType": "Accept",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "*/*"
            },
            {
                "keyType": "Accept-Encoding",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "gzip, deflate, br"
            },
            {
                "keyType": "other",
                "keyValue": "IFTTT-Service-Key",
                "valueType": "other",
                "valueValue": "o3upZAljC5idqJjRIRPIU6hyye83ae0aXshj-YsNW1FrvI9Vd5OcTGnax8VIxBpy"
            }
        ],
        "x": 780,
        "y": 40,
        "wires": [
            [
                "7ef7e28f15eddc4a"
            ]
        ]
    },
    {
        "id": "7ef7e28f15eddc4a",
        "type": "debug",
        "z": "e8f4952174880a7d",
        "name": "events",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 950,
        "y": 40,
        "wires": []
    },
    {
        "id": "7629f3c7025958f2",
        "type": "change",
        "z": "e8f4952174880a7d",
        "name": "set http body",
        "rules": [
            {
                "t": "set",
                "p": "req.body",
                "pt": "msg",
                "to": "payload",
                "tot": "msg"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 590,
        "y": 40,
        "wires": [
            []
        ]
    },
    {
        "id": "98c2e547a962ce56",
        "type": "mqtt in",
        "z": "e8f4952174880a7d",
        "name": "",
        "topic": "IAQ_Measures",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "9bb8382a5cc0f7e3",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 100,
        "y": 40,
        "wires": [
            [
                "1864003d65dae29b"
            ]
        ]
    },
    {
        "id": "1864003d65dae29b",
        "type": "json",
        "z": "e8f4952174880a7d",
        "name": "",
        "property": "payload",
        "action": "obj",
        "pretty": false,
        "x": 270,
        "y": 40,
        "wires": [
            [
                "5f0a04c7e058aa96"
            ]
        ]
    },
    {
        "id": "5f0a04c7e058aa96",
        "type": "function",
        "z": "e8f4952174880a7d",
        "name": "setBody",
        "func": "msg.payload = { \"trigger_identity\": \"f5bbd2d949a754cbaefef9afaac6fe442aa86164\", \"triggerFields\": { \"temp_threshold\": \"25\" }, \"user\": { \"timezone\": \"America/Los_Angeles\" }, \"ifttt_source\": { \"id\": \"19148132cff536aa\", \"url\": \"http://example.com/19148132cff536aa\" }, \"temperature\": msg.payload.measures[5].v}\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 420,
        "y": 40,
        "wires": [
            [
                "7629f3c7025958f2"
            ]
        ]
    },
    {
        "id": "5883e9df39d1bc57",
        "type": "mqtt in",
        "z": "e8f4952174880a7d",
        "name": "",
        "topic": "IAQ_Measures",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "9bb8382a5cc0f7e3",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 100,
        "y": 140,
        "wires": [
            [
                "4d5eac9a47c4edfa",
                "8b8828e1ee3fef48"
            ]
        ]
    },
    {
        "id": "4d5eac9a47c4edfa",
        "type": "json",
        "z": "e8f4952174880a7d",
        "name": "",
        "property": "payload",
        "action": "obj",
        "pretty": false,
        "x": 270,
        "y": 100,
        "wires": [
            [
                "db29536f380a4e6d"
            ]
        ]
    },
    {
        "id": "a94f5f4e665bd8fc",
        "type": "mongodb in",
        "z": "e8f4952174880a7d",
        "mongodb": "32967ebf76841761",
        "name": "findNoderedPetitions",
        "collection": "nodered_petitions",
        "operation": "find",
        "x": 320,
        "y": 300,
        "wires": [
            [
                "11c2b390cc4925f3"
            ]
        ]
    },
    {
        "id": "8b8828e1ee3fef48",
        "type": "template",
        "z": "e8f4952174880a7d",
        "name": "setUUID",
        "field": "payload",
        "fieldType": "msg",
        "format": "handlebars",
        "syntax": "mustache",
        "template": "{\n    \"UUID\": \"7179d7d6-0f75-4b23-905b-16d670a7f7e1\"\n}",
        "output": "str",
        "x": 280,
        "y": 180,
        "wires": [
            [
                "6a0d4114b79b4ada"
            ]
        ]
    },
    {
        "id": "345d5d17fe85e20f",
        "type": "function",
        "z": "e8f4952174880a7d",
        "name": "setUUID",
        "func": "msg.payload = { uuid: msg.payload.UUID }\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 280,
        "y": 260,
        "wires": [
            [
                "a94f5f4e665bd8fc"
            ]
        ]
    },
    {
        "id": "11c2b390cc4925f3",
        "type": "split",
        "z": "e8f4952174880a7d",
        "name": "splitTriggers",
        "splt": "\\n",
        "spltType": "str",
        "arraySplt": 1,
        "arraySpltType": "len",
        "stream": false,
        "addname": "",
        "x": 410,
        "y": 340,
        "wires": [
            [
                "db29536f380a4e6d"
            ]
        ]
    },
    {
        "id": "eba9990d307093fc",
        "type": "function",
        "z": "e8f4952174880a7d",
        "name": "setBody (dinamic)",
        "func": "msg.payload = { \"trigger_identity\": msg.payload.triggerIdentity, \"triggerFields\": { \"threshold\": msg.payload.threshold, \"uuid\": msg.payload.device_info.uuid, \"above_below\": msg.payload.above_below, \"measure\": msg.payload.measure }, \"user\": { \"timezone\": msg.payload.user.timezone }, \"ifttt_source\": { \"id\": msg.payload.ifttt_source.id, \"url\": msg.payload.ifttt_source.url }, \"temperature\": msg.payload.value, \"initial\": 0 }\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 690,
        "y": 160,
        "wires": [
            [
                "4a4c6f6cefa9f8ea",
                "85e57620c36b53c3"
            ]
        ]
    },
    {
        "id": "6a0d4114b79b4ada",
        "type": "json",
        "z": "e8f4952174880a7d",
        "name": "convertToJS",
        "property": "payload",
        "action": "obj",
        "pretty": false,
        "x": 290,
        "y": 220,
        "wires": [
            [
                "345d5d17fe85e20f"
            ]
        ]
    },
    {
        "id": "db29536f380a4e6d",
        "type": "join",
        "z": "e8f4952174880a7d",
        "name": "mergeMeasuresAndTrigger",
        "mode": "custom",
        "build": "merged",
        "property": "payload",
        "propertyType": "msg",
        "key": "topic",
        "joiner": "\\n",
        "joinerType": "str",
        "accumulate": true,
        "timeout": "",
        "count": "",
        "reduceRight": false,
        "reduceExp": "",
        "reduceInit": "",
        "reduceInitType": "",
        "reduceFixup": "",
        "x": 620,
        "y": 100,
        "wires": [
            [
                "117f216f4181aab7"
            ]
        ]
    },
    {
        "id": "117f216f4181aab7",
        "type": "function",
        "z": "e8f4952174880a7d",
        "name": "checkSelectedMeasure",
        "func": "msg.payload.measures.forEach(function(element) {\n    if (element.n == msg.payload.measure) {\n        msg.payload.value = element.v\n    }\n});\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 930,
        "y": 100,
        "wires": [
            [
                "eba9990d307093fc"
            ]
        ]
    },
    {
        "id": "4a4c6f6cefa9f8ea",
        "type": "change",
        "z": "e8f4952174880a7d",
        "name": "set http body",
        "rules": [
            {
                "t": "set",
                "p": "req.body",
                "pt": "msg",
                "to": "payload",
                "tot": "msg"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 890,
        "y": 160,
        "wires": [
            [
                "80c8ce04b7ee3bce"
            ]
        ]
    },
    {
        "id": "80c8ce04b7ee3bce",
        "type": "http request",
        "z": "e8f4952174880a7d",
        "name": "POST request",
        "method": "POST",
        "ret": "txt",
        "paytoqs": "ignore",
        "url": "https://raspy-flower-lungfish.glitch.me//ifttt/v1/triggers/measure",
        "tls": "",
        "persist": false,
        "proxy": "",
        "authType": "",
        "senderr": false,
        "headers": [
            {
                "keyType": "Content-Type",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "application/json"
            },
            {
                "keyType": "Accept",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "*/*"
            },
            {
                "keyType": "Accept-Encoding",
                "keyValue": "",
                "valueType": "other",
                "valueValue": "gzip, deflate, br"
            },
            {
                "keyType": "other",
                "keyValue": "IFTTT-Service-Key",
                "valueType": "other",
                "valueValue": "o3upZAljC5idqJjRIRPIU6hyye83ae0aXshj-YsNW1FrvI9Vd5OcTGnax8VIxBpy"
            }
        ],
        "x": 1060,
        "y": 160,
        "wires": [
            []
        ]
    },
    {
        "id": "85e57620c36b53c3",
        "type": "debug",
        "z": "e8f4952174880a7d",
        "name": "debug 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 900,
        "y": 260,
        "wires": []
    },
    {
        "id": "9bb8382a5cc0f7e3",
        "type": "mqtt-broker",
        "name": "IAQ",
        "broker": "172.16.30.161",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    },
    {
        "id": "32967ebf76841761",
        "type": "mongodb",
        "hostname": "events.c5dzfdz.mongodb.net",
        "topology": "dnscluster",
        "connectOptions": "",
        "port": "27017",
        "db": "prueba_mongo",
        "name": ""
    }
]