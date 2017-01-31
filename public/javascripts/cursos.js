"use strict";

var numPag = 5;
var currentPag = 1;

$(document).ready(function() {
	console.log("DOM inicializado");

	$("#alerts").hide();

	$("#paginacion").on("click", "a", busqueda);

	$("#tablaBusqueda").hide();

	$("#tablaBusqueda").on("click", "tbody > tr", printInfoCurso)

	$("#paginacion").hide();

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
			$("#tablaBusqueda").show();
			data.result.forEach(function(curso) {
				$("#tablaBusqueda").find("tbody").append(
					$("<tr>")
						.append($("<td>").prop("id", curso.id).text(curso.titulo))
						.append($("<td>").text(curso.localidad))
						.append($("<td>").text(curso.fecha_ini))
						.append($("<td>").text(curso.fecha_fin))
				);
			});
			paginacion(data.numRow, paginas);
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#paginacion").find("ul").empty();
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
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
			$("#alerts").toggleClass('alert-warning alert-success');
			$("#alerts").find("p").html("usuario insertado con id " + data.id);
			$("#alerts").show();
			$('#logModal').modal('hide');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
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
			console.log(data.imagen.data.length);
			$("#infoCurso").modal();
			$("#infoCurso").find("h4.modal-title").html(data.titulo);
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
					.append($('<p>').text(data.plazas)));
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
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
				$("#identificarse").parent().parent()
					.append($('<li>').append($('<a>').prop("id","loginLabel").text(email)))
					.append($('<li>')
						.append($('<button>')
							.prop("id","logout")
							.prop("class", "btn btn-default").text('logout')));
				$('#logout').on("click", logout);	
				$("#identificarse").hide();
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
			$("#loginLabel").parent().remove();
			$("#logout").parent().remove();
			$("#identificarse").show();
		}
	});
}