var express = require('express');
var app = express();

var net = require('net');
var hex2ascii = require('hex2ascii');
var mysql = require('mysql');
//PostgreSQL
var PostgreSQL = require('pg');
var PostgreSQLConnection = "postgres://clienteservidor:clienteservidor@134.209.76-81:5432/fernandodb";

var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
  for (var k2 in interfaces[k]) {
	var address = interfaces[k][k2];
	if (address.family === 'IPv4' && !address.internal) {
	  addresses.push(address.address);
	}
  }
}


var HOST = '134.209.76.81';
var PORT = 1011;//Este puerto debe cambiar, es el puerto para el socket
server.listen(5678);// Este puerto es para el clente en angular
var arr;
var arr1;
var global_imei="";

var sockets = [];
var web_sockets = [];




io.on('connection', function(socket) {
  web_sockets.push(socket)
  
  socket.on('disconnect', function() {
	var idx = web_sockets.indexOf(socket);
	if (idx != -1) {
	  web_sockets.splice(idx, 1);
	}
  });

  //	Evento que escuchará cuando un mensaje sea enviado
  //	El nombre del evento puede ser cualquiera.
  //	Del lado del cliente deber ser algo así:
  //	[variable_socket].emit('msj','Hola Node');
  socket.on('msj',function(mensaje){
  	//	Siguiendo con el ejemplo anterior, 
  	//	la variable mensaje contiene un string.
  	
  	//Almacenar en una base de datos el mensaje
  	console.log("El cliente " + sock.remoteAddress +':'+ sock.remotePort + " dice: " + mensaje);
  	uploadMessageToDatabase(mensaje);
  });

  socket.on('end', function() {

  });

  socket.on('error', function() {

  });

  socket.on('timeout', function() {
	
  });

  socket.on('close', function() {
	
  });

});

io.on('error',function(err){ 
  console.error(err)
});



net.createServer(function(sock) {
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
  sock.on('data', function(data) {
  });

}).listen(PORT, HOST);


function getCleanedString(cadena){
   // Definimos los caracteres que queremos eliminar
   var specialChars = "!@#$^&%*()+=[]\/{}|:<>?.";

   // Los eliminamos todos
   for (var i = 0; i < specialChars.length; i++) {
	 cadena= String(cadena).replace(new RegExp("\\" + specialChars[i], 'gi'), '');
   }   

   // Lo queremos devolver limpio en minusculas
   cadena = cadena.toLowerCase();

   // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
   cadena = cadena.replace(/([\ \t]+(?=[\ \t])|^\s+|\s+$)/g,',');

   // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
   cadena = cadena.replace(/á/gi,"a");
   cadena = cadena.replace(/é/gi,"e");
   cadena = cadena.replace(/í/gi,"i");
   cadena = cadena.replace(/ó/gi,"o");
   cadena = cadena.replace(/ú/gi,"u");
   cadena = cadena.replace(/ñ/gi,"n");
   return cadena;
 }


/**
 * Función que almacena un nuevo registro en la base de datos (PostgreSQL)
 * @param  {String} msj Mensaje enviado desde el cliente (Angular)
 * @return {[type]}     [description]
 */
function uploadMessageToDatabase(msj)
{
	//Se declara una instancia de la conexión
	let cliente = new PostgreSQL.Client(PostgreSQLConnection);
	cliente.connect();

	//Consulta
	let query = cliente.query("INSERT INTO mensajes(mensaje) values($_msj)",[msj]);
	//Cerrar la conexión despúes de que fue insertado el mensaje
	query.on('end', function() {
    	cliente.end();
	});

	return true;
}
