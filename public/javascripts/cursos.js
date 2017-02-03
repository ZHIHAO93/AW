"use strict";

var user = 0;
var curso = 0;
var numPag = 5;
var currentPag = 1;

$(document).ready(function() {
	console.log("DOM inicializado");

	$("#busqueda").on("click", function(e) {
		$("#busqueda").parent().attr("class", "active");
		$("#navMisCursos").parent().attr("class", "desactive");
		$("#divBusqueda").show();
		$("#misCursos").hide();
		e.preventDefault();
	})

	$("#paginacion").on("click", "a", busqueda);

	$("#tablaBusqueda").hide();

	$("#tablaBusqueda").on("click", "tbody > tr", printInfoCurso)

	$("#paginacion").hide();

	$("#misCursos").hide();

	$("#navMisCursos").hide();

	$("#navMisCursos").on("click", mostrarMisCursos);

	$("#logo").on("click", function(e) {
		e.preventDefault();
	});

	$("#buscar").on("submit", busqueda);

	$("#identificarse").on("click", function() {
		$('#logModal').modal();
		$('h4.modal-title').html("Identificación");
		$('#ident').show();
		$('#nuevo').hide();
	});

	$("#ident").on("submit", comprobarUsuario);

	$("#logModal").on('hidden.bs.modal', function() {
		$(this).find("input").val('').end();
	})

	$("#nuevaCuenta").on("click", nuevaCuenta);

	$("#formNuevoUsuario").on("submit", nuevoUsuario);

	$("#bInscribirse").on("click", inscribirCurso);
});

function busqueda(e) {
	var paginas = $(this).data('pag');
	$("#tablaBusqueda").find("tbody > tr").remove();
	$.ajax({
		type: "GET",
		url: "/busqueda",
		data: {
			str: $("#buscarPalabra").val(),
			num: numPag,
			pos: (paginas-1) * numPag},
		success: function(data, textStatus, jqXHR ) {
			var tabla = $("#tablaBusqueda");
			tabla.show();
			data.result.forEach(function(curso) {
				tabla.find("tbody").append(
					$("<tr>")
						.append($("<td>").prop("id", curso.id).text(curso.titulo))
						.append($("<td>").text(curso.localidad))
						.append($("<td>").text(curso.fecha_ini))
						.append($("<td>").text(curso.fecha_fin))
						.append($("<td>").text(curso.vacantes))
				);
				if(curso.vacantes === 0) {
					$("#tablaBusqueda:last-child table>tbody>tr:last").addClass("danger");
				} else if(curso.vacantes === 1) {
					$("#tablaBusqueda:last-child table>tbody>tr:last").addClass("warning");
				}
			});
			paginacion(data.numRow, paginas);
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#paginacion").find("ul").empty();
		}
	});
	e.preventDefault();
}

function paginacion(numRow, current) {
	$("#paginacion").find("ul").empty();
	var paginas = numRow / numPag + 1;
	var i;
	if(paginas >= 2) {
		if(current !== 1){
			$("#paginacion").find("ul")
				.append($('<li>')
					.append($('<a>')
						.prop("href", "#")
						.attr("data-pag", current-1)
					.append($('<span>').prop("aria-hidden","true").append('&laquo;'))));
		} else {
			$("#paginacion").find("ul")
				.append($('<li>').prop("class", "disabled")
					.append($('<span>').prop("aria-hidden","true").append('&laquo;')));
		}
	}
	for(i=1; i<=paginas; i++) {
		if(i === current){
			$("#paginacion").find("ul")
				.append($('<li>').prop("class", "active")
					.append($('<a>')
						.prop("href","#").text(i)));
		} else {
			$("#paginacion").find("ul")
				.append($('<li>')
					.append($('<a>')
						.prop("href","#")
						.attr("data-pag",i).text(i)));
		}
	}
	if(paginas >= 2) {
		if(paginas-current <= 1){
			$("#paginacion").find("ul")
				.append($('<li>').prop("class", "disabled")
					.append($('<span>').prop("aria-hidden","true").append('&raquo;')));
		} else {
			$("#paginacion").find("ul")
				.append($('<li>')
					.append($('<a>')
						.prop("href", "#")
						.attr("data-pag", current+1)
					.append($('<span>').prop("aria-hidden","true").append('&raquo;'))));
		}
	}
	$("#paginacion").show();
}

function nuevaCuenta(e) {
	$('h4.modal-title').html("Nuevo usuario");
	$('#ident').hide();
	$('#nuevo').show();
	e.preventDefault();
};

function nuevoUsuario(e) {
	$.ajax({
		type: "POST",
		url: "/nuevoUsuario",
		contentType: "application/json",
		data: JSON.stringify({
			correo: $("#newCorreo").val(),
			password: $("#newPassword").val(),
			nombre: $("#nombre").val(),
			apellido: $("#apellido").val(),
			sexo: $("#sexo").val(),
			nacimiento: $("#nacimiento").val() }),
		success: function(data, textStatus, jqXHR ) {
			$('#logModal').modal('hide');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
		
		}
	});
	e.preventDefault();
};

function printInfoCurso() {
	$("#infoCurso").find("div.modal-body").empty();
	var idCurso = $($(this).find('td')[0]).attr('id');
	$.ajax({
		type: "GET",
		url: "/leerCurso",
		data: {
			id: idCurso},
		success: function(data, textStatus, jqXHR ) {
			curso = idCurso;
			$("#infoCurso").modal();
			$("#infoCurso").find("h4.modal-title").text(data.titulo);
			if(data.imagen.data.length === 0){
				$("#infoCurso").find("div.modal-body")
					.append($('<div>').prop("class", "row")
						.append($('<p>').prop("class", "col-lg-12").text(data.descripcion)));
			} else {
				$("#infoCurso").find("div.modal-body")
					.append($('<div>').prop("class", "row")
						.append($('<p>').prop("class", "col-lg-9").text(data.descripcion))
						.append('<img class="pull-right col-lg-3" src="/cursos/' + idCurso + '/imagen" />'));
			}
			$("#infoCurso").find("div.modal-body")	
				.append($('<div>')
					.append($('<p>').append($('<strong>').text('Lugar de impartición:')))
					.append($('<p>').text(data.direccion)))
				.append($('<div>')
					.append($('<p>').append($('<strong>').text('Ciudad:')))
					.append($('<p>').text(data.localidad)))
				.append($('<div>')
					.append($('<p>').append($('<strong>').text('Horario:')))
					.append($('<p>').text(data.horario)))
				.append($('<div>')
					.append($('<p>').append($('<strong>').text('Número de plazas:')))
					.append($('<p>').text(data.plazas + " (" + data.vacantes + " vacantes)")));
		},
		error: function(jqXHR, textStatus, errorThrown ) {
		
		}
	});
}

function comprobarUsuario(e) {
	var email = $("#correo").val();
	var contrasena = $("#password").val();

	var cadenaBase64 = btoa(email + ":" + contrasena);
	$.ajax({
		type: "GET",
		url: "/comprobarUsuario",
		beforeSend: function(req) {
			req.setRequestHeader("Authorization", 
								 "Basic " + cadenaBase64);
		},
		success: function(data, textStatus, jqXHR ) {
			$('#correo').val('');
			$('#password').val('');
			$('#logModal').modal('hide');
			if(data.permitido) {
				console.log("Acceso permitido!");
				user = data.id;
				$("#identificarse").parent().parent()
					.append($('<li>').append($('<a>').prop("id","loginLabel").text(email)))
					.append($('<li>')
						.append($('<button>')
							.prop("id","logout")
							.prop("class", "btn btn-default").text('logout')));
				$('#logout').on("click", logout);	
				$("#identificarse").hide();
				$("#navMisCursos").show();
			}
		}
	});
	e.preventDefault();
}

function logout() {
	$.ajax({
		type: "GET",
		url: "/logout",
		success: function(data, textStatus, jqXHR ) {
			console.log("Logout");
			user = 0;
			curso = 0;
			$("#loginLabel").parent().remove();
			$("#logout").parent().remove();
			$("#identificarse").show();
		}
	});
}

function inscribirCurso() {
	$.ajax({
		type: "POST",
		url: "/inscribirCurso",
		contentType: "application/json",
		data: JSON.stringify({
			id_usuario: user,
			id_curso: curso}),
		success: function(data, textStatus, jqXHR ) {
			$("#infoCurso").modal('hide');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
		
		}
	});

}

function mostrarMisCursos(e) {
	$("#busqueda").parent().attr("class", "desactive");
	$("#navMisCursos").parent().attr("class", "active");
	$("#divBusqueda").hide();
	$("#misCursos").show();

	cargarProximosCursos();
	cargarCursosRealizados();

	e.preventDefault();
}

function cargarProximosCursos() {
	$("#tablaProximos").find("tbody > tr").remove();
	$.ajax({
		type: "GET",
		url: "/usuario/" + user + "/proximosCursos",
		success: function(data, textStatus, jqXHR ) {
			data.forEach(function(curso) {
				$("#tablaProximos").find("tbody").append(
					$("<tr>")
						.append($("<td>").prop("id", curso.id).text(curso.titulo))
						.append($("<td>").text(curso.localidad))
						.append($("<td>").text(curso.fecha_ini))
						.append($("<td>").text(curso.fecha_fin))
				);
			});
		}
	});
}

function cargarCursosRealizados() {
	$("#tablaRealizados").find("tbody > tr").remove();
	$.ajax({
		type: "GET",
		url: "/usuario/" + user + "/cursosRealizados",
		success: function(data, textStatus, jqXHR ) {
			data.forEach(function(curso) {
				$("#tablaRealizados").find("tbody").append(
					$("<tr>")
						.append($("<td>").prop("id", curso.id).text(curso.titulo))
						.append($("<td>").text(curso.localidad))
						.append($("<td>").text(curso.fecha_ini))
						.append($("<td>").text(curso.fecha_fin))
				);
			});
		}
	});
}