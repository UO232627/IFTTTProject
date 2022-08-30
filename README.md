# IFTTTProject

Proyecto de integración del IAQ de Envira con IFTTT.

## Estructura de ficheros

- *docker*: Contiene todos los ficheros necesarios para el despliegue del servidor en un contenedor Docker
  - *.dockerignore*: Contiene los directorios que no se deben añadir al contenedor Docker
  - *.env*: Contiene las variables de entorno globales
  - *.gitignore*: Contiene los directorios y ficheros que no se deben añadir a git
  - *Dockerfile*: Contiene los comandos necesarios para la creación de la imagen Docker
  - *helpers.js*: Modulo del servidor con funciones auxiliares
  - *middleware.js*: Modulo del servidor con funciones auxiliares relacionadas con peticiones http
  - *mongodb.js*: Modulo del servidor con funciones auxiliares relacionadas con Mongodb
  - *package.json*: Contiene la información y módulos necesarios en el servidor
  - *server.js*: Programa principal del servidor
- *documentation*: Documentación completa del proyecto
  - *img*: Contiene las imágenes usadas en la documentación
  - *documentation.md*: Contiene la documentación completa del proyecto
- *nodered*: Flow necesario en Node-RED para el procesado de los datos y la realización de peticiones http
- *server*: Contiene los ficheros del servidor Node.js
  - *.env*: Contiene las variables de entorno globales
  - *helpers.js*: Modulo del servidor con funciones auxiliares
  - *middleware.js*: Modulo del servidor con funciones auxiliares relacionadas con peticiones http
  - *mongodb.js*: Modulo del servidor con funciones auxiliares relacionadas con Mongodb
  - *package.json*: Contiene la información y módulos necesarios en el servidor
  - *server.js*: Programa principal del servidor
