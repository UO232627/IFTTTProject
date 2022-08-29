# Documentación proyecto integración Envira IAQ - [IFTTT](https://ifttt.com/) (*IF This Then That*)

## Esquema del entorno

![Esquema entorno](img\schema.png "Esquema entorno")

## IFTTT: Conceptos básicos

En este apartado se explicarán los elementos básicos de IFTTT.

- *Services*: Representación de los productos de un usuario. En ellos se configuran y almacenan los elementos que se quieran desplegar, como por ejemplo, triggers.

![Services](img\services.PNG "Services")

- *Applets*: Workflow automatizado que unen varios servicios para que el usuario pueda hacer algo que los servicios no podrían hacer por si mismos. Por ejemplo, si la temperatura medida es mayor a 30ºC, enviar una notificación al movil, sería un applet que une la comprobación de cuál es la temperatura (*trigger*) con el envío de notificaciones a móviles (*action*)
- *Triggers*: Condiciones *IF*. Se pueden configurar con parámetros de entrada y pasan información al resto de elementos del applet. Cuando se cumple la condición que se indica, hace que el resto del workflow se siga ejecutando.
- *Queries*: Obtienen información adicional necesaria para la ejecución del workflow y la envía al resto de elementos. Un ejemplo puede ser obtener la humedad ambiente mediante una *API* externa
- *Filters*: Código *JavaScript* con el que se pueden manipular y procesar los datos recibidos desde los *triggers* y *queries*. Por ejemplo, si queremos que la comprobación de temperatura solo sea durante días laborables, podemos eliminar los fines de semana aquí mediante código
- *Actions*: Acciones que se quieren llevar a cabo cuando se ejecuta el workflow. Encender el aire acondicionado cuando las condiciones se cumplan puede ser un ejemplo de *action*

## IFTTT: Configuración

### Service-Key y URL de la API

La primera configuración que se debe hacer es obtener nuestra *Service-Key* e indicar al servicio cual será la URL de conexión a la *API*.

Para ello, en caso de que no se tenga un servicio creado, se debe crear uno. Hacer click en la opción de menú "Developers". En el dropdown al lado de la organización, añadir el nuevo servicio mediante el botón "Add Service".

![Add Service](img\addService.PNG "Add Service")

A continuación, en la pestaña "API", encontramos la *Service-Key*. Para indicar la URL que se quiere usar para la *API*, se pega en el recuadro correspondiente y guardamos la configuración en el botón "Save".

![URL y Service-Key](img\URL_ServiceKey.PNG "URL y Service-Key")

### Triggers, queries y actions

La configuración de estos tres elementos es similar, por lo que se explicarán mediante la configuración de un *trigger*.

En primer lugar, se tiene que añadir un nuevo *trigger*. Para ello, en la pestaña "API", dentro del apartado "Triggers", añadir uno nuevo en el botón "New trigger". IFTTT pedirá que se le de un nombre, una descripción y un *endpoint* para la *API*. Guardar la configuración en el botón "Save".

![Nuevo trigger](img\newTrigger.PNG "Nuevo trigger")

Cuando esté creado, se podrá configurar. Las opciones que se pueden configurar son *Trigger fields*, *Verbiage* e *Ingredients*. En caso de que no se quiera hacer esta configuración, se puede empezar con las plantillas que proporciona *IFTTT* al final de la página.

- *Trigger fields*: Parámetros de entrada que el usuario tiene que indicar para configurar un *trigger*. Esta información se deberá enviar más adelante en todas las peticiones *http* que se hagan contra el *endpoint* de este *trigger* en la *API*. Para cada uno de estos campos debe indicarse:
  - *Label*: Nombre que se le quiere dar
  - *Optional text helper*: Texto descriptivo del campo para guiar al usuario cuando introduzca los valores
  - *Key name*: Nombre que se le va a dar para tratarlo internamente
  - *Private*: Si se selecciona, el campo no se ve públicamente en las *applet* que se publiquen
  - *Input type*: Tipo del dato de entrada. En caso de que se quiera una lista en un dropdown, se pueden fijar los valores que se quiere que tomen (indicando su *Label* y su *Value*)
![Input type](img\inputType.png "Input type")
![Trigger field list](img\triggerFieldList.png "Trigger field list")
  - *Input validation*: Indica si se quiere validar los datos introducidos o no
  - *Validation rule*: Si se quiere validar, indica las condiciones para hacerlo
![Validation rule](img\validationRule.png "Validation rule")

- *Verbiage*: Texto que ve el usuario cuando use el *trigger* para un *applet*. Explica brevemente cuál es el funcionamiento del *trigger*. Su estructura es "If **verbiage**, then ...". Se pueden usar los *trigger* fields para añadir información en función de lo que ingrese el usuario, mediante "{{ fields.key }}" o mediante el botón "Add ingredient".
![Verbiage](img\verbiage.png "Verbiage")

- *Ingredients*: Elementos que envían la información al resto de elementos con los que se conecte el *trigger* para poder usarlos de forma interna. Todos los *triggers* deben tener al menos un *ingredient* (suele usarse uno llamado CreatedAt). Los campos que deben indicarse son:
  - *Name*: Nombre que se le quiere dar
  - *Slug*: Nombre con el que se va a tratar de forma interna
  - *Note*: Breve descripción
  - *Type*: Tipo del dato
![Ingredient type](img\ingredientType.png "Ingredient type")
  - *Example*: Ejemplo de como es el dato. Es obligatorio, ya que se usará para las peticiones automáticas que genera IFTTT

### Creación de un applet

Una vez creados los elementos del servicio, se pueden probar añadiendolos a un applet. Para ello, en el menú superior ir al apartado "Create". Se verá una pantalla similar a esta:

![Create applet](img\create.png "Create applet")

En ella se puede ver la estructura de un *applet*. Para configurarlo, primero tenemos que indicar cuál se quiere que sea el *trigger*. En este ejemplo se usará el creado en el apartado anterior. Haciendo click en "Add", saldrá una pantalla en la que tendremos todos los servicios publicados en IFTTT

![Choose a service](img\chooseService.png "Choose a service")

En este punto, se puede ver el servicio que se ha estado configurando pese a no estar publicado ya que es propio del usuario de la cuenta. Una vez se publique, todo el mundo podría verlo y buscarlo. Seleccionandolo saldrá la pantalla con los *triggers* de ese *servicio*

![Triggers service](img\triggersService.png "Triggers servive")

Una vez seleccionado se verán los campos indicados anteriormente en los *trigger fields*. Se deben rellenar y hacer click en "Create trigger"

![Trigger trigger fields](img\triggerTriggerFields.png "Trigger trigger fields")

Ya está configurado el *trigger*. Ahora es cuando se podrían añadir *queries* y *filters*, pero solo es posible con las versiones "PRO" y "PRO+" de IFTTT. El último paso es añadir una *action* al workflow, de manera similar a como se ha hecho con el *trigger*. Al no tener ninguna propia, se hará la prueba con una genérica de envio de emails. Hacer click en "Add" como al añadir el *trigger* y en el buscador escribir "email". Seleccionar la opción "email" de la izquierda

![Email](img\email.png "email")
![Email action](img\emailAction.png "Email action")

**NOTA**- *Cuando se usen servicios de otras marcas y compañias, es posible que pida una cuenta o que se introduzcan algún tipo de credenciales propietarias de sus servicios.*

En la nueva pantalla, se deben rellenar los campos como se ha hecho con el *trigger*. Como se puede observar, se pueden usar los *ingredients* creados anteriormente para pasar información de manera "dinámica" a los campos. Clickar en "Create action"

![Email fields](img\emailFields.png "Email fields")

Una vez configurados ambos, el *applet* debería verse simmilar a este:

![Complete applet](img\completeApplet.png "Complete applet")

Haciendo click en "Continue" veremos una nueva página en la que se ve el *verbiage* configurado anteriormente, pudiendo editarlo como se quiera

![Applet verbiage](img\appletVerbiage.png "Applet verbiage")

Seleccionar "Finish" y ya estaría el *applet* creado. En este ejemplo, se enviaría un email al correo indicado en la configuración del *applet* cada vez que la temperatura medida por el IAQ superase los 30ºC.

## IFTTT: Funcionamiento

Usando su Realtime API, IFTTT espera en las respuestas a sus peticiones una lista con los últimos eventos de la triggerIdentity con la que se relaciona. Esta lista es de tamaño 50 por defecto salvo que se indique otro valor. La API Realtime se encarga de comprobar si en la lista de eventos hay alguno con un ID nuevo. En ese caso, hace saltar el trigger correspondiente y comienza la ejecución del applet. Los eventos devueltos no son solo los más recientes, sino que tienen que ser los 50 últimos se haya comprobado o no si son nuevos.

En caso de que no se use la API Realtime, IFTTT hace un poll para comprobar los nuevos eventos cada hora (en la versión gratuita)

## IFTTT: API

Para el tratamiento de cada uno de los elementos de los servicios, se necesitan *endpoint* específico. Estos *endpoint* se tratarán en una *API* que recibirá peticiones *http* y devolverá respuestas que IFTTT pueda interpretar.

Para alojar la *API*, se necesita un servidor. En este caso, se documentará el ejemplo con un servidor desarrollado en Node.js.

La estructura de ficheros es la siguiente:

- *.env*: Contiene las variables de entorno. En este caso solo una, IFTTT_SERVICE_KEY, para comprobar que las peticiones contienen una *key* válida
- *helpers.js*: Métodos auxiliares usados en *server.js* para realizar operaciones externas a los *endpoint*
- *middleware.js*: Métodos que se invocan en las peticiones recibidas para hacer comprobaciones
- *mongodb.js*: Métodos relacionados con la base de datos usada
- *package.json*: Indica las dependencias y configuración del servidor
- *server.js*: Programa principal. Inicia la ejecución y contiene todos los *endpoint* necesarios

### NOTA - La documentación de cada uno de los métodos y su funcionamiento estará dentro del propio código del servidor

## IFTTT: Node-RED

Para la creación y envío de las peticiones que irán contra la *API*, se usa un flow en Node-RED.

**NOTA** - *Es necesario tener la paleta "node-red-node-mongodb" para poder conectarse a la base de datos.*

![Flow nodered](img\flowNodered.png "Flow Node-RED")

Los nodos del flow son los siguientes:

- *IAQ_Measures*: Nodo *MQTT* que está suscrito al topic "IAQ_Measures". Recibe las medidas de los IAQ conectados al broker configurado
- *measureToJS*: Convierte el mensaje de JSON a un objeto JavaScript
- *setUUID* (template): Inserta una plantilla con el *UUID* del dispositivo
- *convertToJS*: Convierte el UUID en un objeto JavaScript para tratarlo más facilmente
- *setUUID* (function): Transforma el payload del mensaje para dejarlo de la manera correcta para procesarlo más adelante
- *findNoderedPetitions*: Se conecta al cluster de Mongodb para recuperar los datos necesarios para realizar las peticiones. Configuración:
![Node-RED Mongodb](img\noderedMongodb.png "Node-RED Mongodb")

  - *Server*: Configuración de la conexión al cluster de Mongodb

    - *Host*: URL de la conexión al cluster
    - *Connection topology*: Tipo de conexión
    - *Connect options*: Opciones de la conexión (se puede dejar sin rellenar)
    - *Database*: Nombre de la base de datos a la que se quiere conectar
    - *Username*: Nombre de un usuario registrado en la base de datos indicada
    - *Password*: Contraseña para el usuario indicado
    - *Name*: Nombre que se le quiere dar a la configuración

    ![Node-RED Mongodb Server](img\noderedMongodbServer.png "Node-RED Mongodb Server")
  - *Collection*: Colección sobre la que queremos hacer las operaciones
  - *Operation*: Tipo de operación que se quiere hacer
  - *Name*: Nombre que se le quiere dar al nodo en Node-RED
- *splitTriggers*: Separa cada uno de los documentos extraidos de la base de datos (cada uno representa un *trigger* distinto)
- *mergeMeasuresAndTrigger*: Por cada *trigger*, lo junta con la medida tomada del IAQ en un objeto JavaScript
- *checkSelectedMeasure*: Almacena en payload.value el valor de la medida indicada en el trigger
- *setBody (dinamic)*: Crea el body de la petición *http* con todos los campos necesarios para que la API lo pueda procesar e IFTTT lo entienda correctamente
- *petitionBody*: Nodo debug para comprobar que el cuerpo de la petición está bien formado
- *setHttpBody*: Inserta en msg.req.body el payload con la petición ya formada
- *POST request*: Realiza la petición *http* (POST). Hay que indicar la URL de la petición (*<https://raspy-flower-lungfish.glitch.me//ifttt/v1/triggers/measure>* en este ejemplo). Las cabeceras necesarias son:

  - *Content-type: application/json*
  - *Accept: `*/*`*
  - *Accept-Encoding: gzip, deflate, br*
  - *IFTTT_Service_Key: o3upZAljC5idqJjRIRPIU6hyye83ae0aXshj* (Es la key de la API del servicio IFTTT, esta es la usada en el ejemplo hasta ahora)
- *convertResponseToJS*: Convierte la respuesta a la petición en un objeto JavaScript
- *httpResponse*: Nodo debug para comprobar que la respuesta a la petición enviada es la correcta

Ejemplo del cuerpo de las peticiones enviadas:

``` JSON
{
  "trigger_identity": "201dc7dc99ca589072bb1fbb8955ee533407f94e",
  "triggerFields": {
    "threshold": 30,
    "uuid": "7179d7d6-0f75-4b23-905b-16d670a7f7e1",
    "above_below": ">",
    "measure": "temp"
  },
  "user": {
    "timezone": "Europe/Madrid"
  },
  "ifttt_source": {
    "id": "128853616",
    "url": "https://ifttt.com/applets/LPU7NgfL"
  },
  "value": 32.17,
  "initial": 0
}
```

En todas las peticiones contra la *API*, se deben incluir los valores de los *trigger fields* del *trigger* contra el que se esté haciendo.
*User* e *ifttt_source* son elementos que IFTTT pide que se envien en todas las peticiones. En este caso, se autogeneran recogiendolos cuando se hace la primera conexión y almacenandolo en la base de datos para luego recuperarlo en Node-RED.
Los valores que no son *trigger fields* o los requeridos por IFTTT, pueden no ir en la petición. Sin embargo, en el caso del servidor de ejemplo aquí documentado, no se pueden tratan muchos de los errores que se pueden producir en caso de que no estén todos los campos requeridos, ya que IFTTT no envía estos campos en sus *poll*.

## IFTTT: Mongodb

Para la persistencia en el la prueba de concepto se ha usado Mongodb, ya que para esta aplicación es una buena opción usar una base de datos basada en documentos.

La estructura que se tiene es la siguiente:

![Mongodb estructura](img\mongodbEstructura.png "Mongodb estructura")

Dentro de las colecciones, tenemos las siguientes estructuras:

- *nodered_petitions*

  ![nodered_petitions](img\mongodbPetitions.png "nodered_petitions")

- *triggerIdentities*

  ![triggerIdentities](img\mongodbIdentities.png "triggerIdentities")

## IFTTT: Pruebas automáticas

Una vez nuestro servicio está configurado, se deben pasar los test automáticos que proporciona IFTTT. Para ello, desde la pestaña "API" donde se creaban los triggers, etc., se accede al apartado "Endpoint test"

![Test](img\test.png "Test")

Haciendo click en el botón "Begin test", se empiezan a ejecutar los test. Una vez terminado, aparecerán todos marcados en verde si han pasado correctamente o en rojo si alguno ha fallado (indicando cual)

![Test passed](img\testsPassed.png "Test passed")

Los test prueban todas las posibilidades posibles, controlando que los errores se controlen correctamente y que se procesan bien las peticiones variando campos y valores.

![Test trigger](img\testsTrigger.png "Test trigger")

Dentro de cada apartado de los test, muestran la petición que se ha hecho con cabeceras, cuerpo, etc. y la respuesta completa. Esto puede ser muy util para replicar los test en caso de que alguno falle y para ver como son las peticiones y respuestas que requiere

![Test request](img\testRequest.png "Test request")
![Test respones](img\testResponse.png "Test response")

## IFTTT: Publicación del servicio

Una vez los test automáticos estén pasados y se hagan test propios para comprobar que todo funciona correctamente y es robusto, se puede publicar el servicio para que todo el mundo pueda acceder a él.

Para ello, desde la página del servicio (al lado de la pestaña "API" donde se configuraron los elementos y se hicieron los test), se puede publicar. Cuando se trate de publicar, IFTTT tiene que revisarlo y darlo por bueno.

Para poder pasar la validación son necesarios:

- Logo para el applet en formato .svg y fondo blanco
- Los test automáticos tienen que pasar correctamente
- En caso de usar autenticación, hay que mencionar a IFTTT e incluir un mensaje de consentimiento
- El email de soporte tiene que ser un email dedicado, no puede ser uno personal o con otros usos
- La estructura del servicio tiene que ser correcta. No puede haber placeholders, mala gramática, descripciones que no se corresponden con lo descrito, etc.
- Si se ha hecho una query, tiene que aportar algún valor

Una vez pasada la validación, IFTTT se pondría en contacto para seguir con los trámites, como por ejemplo, indicar la fecha en la que se quiere publicar el servicio. Una vez más, se revisaría el servicio antes de lanzarlo y si todo está correcto, se lanzaría.

El mantenimiento del servicio corre a cuenta del desarrollador, no de IFTTT.

## Documentación externa

- [Documentación completa de IFTTT](https://ifttt.com/docs)
- [Repositorio buscador trenes](https://github.com/Fullercon/train-finder)
- [Repositorio alertas tráfico](https://github.com/apastel/traffic-alert). Este es en el que se ha basado el desarrollo de la API
