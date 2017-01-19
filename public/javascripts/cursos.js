"use strict";

$(document).ready(function() {
	console.log("DOM inicializado");

	$("#alerts").hide();

	$("#logo").on("click", inicio);

	$("#busqueda").on("click", function(e) {
		$('#busqueda').parent().attr("class", "active");
		$('#contenido').load('/busqueda');
		e.preventDefault();
	});

	$("#identificarse").on("click", function() {
		$('#logModal').modal();
		$('h4.modal-title').html("Identificación");
		$('#ident').show();
		$('#nuevo').hide();
	});

	$("#nuevaCuenta").on("click", nuevaCuenta);

	$("#formNuevoUsuario").on("submit", nuevoUsuario);

	$("#bInsertaCurso").on("click", function() {
		$('#selector-imagen').on("change", function() {
			$('#mi-selector').val($(this).val());
		});
		$('#cursoModal').modal();
		$("#formNuevoCurso").on("submit", nuevoCurso);
	});

	$("#bModificaCurso").on("click", function() {
		$('#cursoUpdateModal').modal();
		$('#formUpdateCurso').on('submit', modificarCurso);
	})

	$("#bEliminaCurso").on("click", function() {
		$("#cursoDeleteModal").modal();
		$("#bEliminarCurso").on("click", eliminarCurso);
	});

	$("#bLeeCurso").on("click", function() {
		$('#cursoLeerModal').find('h4.modal-title').html("Leer curso");
		$('#cursoLeerModal').find('div.form-group').show();
		$('#cursoLeerModal').find('input.form-control').val('');
		$('#bLeerCurso').show();
		$('#infoCurso').html('');
		$("#cursoLeerModal").modal();
		$("#bLeerCurso").on("click", leerCurso);
	});
});

function inicio(e) {
	$('#busqueda').parent().attr("class", "desactive");
	$('#contenido').load('/principal');
	e.preventDefault();
};

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
			correo: $("#correo").val(),
			password: $("#password").val(),
			nombre: $("#nombre").val(),
			apellido: $("#apellido").val(),
			sexo: $("#sexo").val(),
			nacimiento: $("#nacimiento").val() }),
		success: function(data, textStatus, jqXHR ) {
			$("#alerts").toggleClass('alert-warning alert-success');
			$("#alerts").find("p").html("usuario insertado con id " + data.id);
			$("#alerts").show();
			$('#logModal').modal('toggle');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
		}
	});
	e.preventDefault();
};

function nuevoCurso(e) {
	$.ajax({
		type: "POST",
		url: "/nuevoCurso",
		contentType: "application/json",
		data: JSON.stringify({
			titulo: $("#titulo").val(),
			descripcion: $("#descripcion").val(),
			localidad: $("#localidad").val(),
			direccion: $("#direccion").val(),
			imagen: $("#mi-selector").val(),
			plazas: $("#plazas").val(),
			fecha_ini: $("#fecha_ini").val(),
			fecha_fin: $("#fecha_fin").val(),
			horario: $("#horarios_ini").val() + "-" + $("#horarios_fin").val()
			}),
		success: function(data, textStatus, jqXHR ) {
			$("#alerts").toggleClass('alert-warning alert-success');
			$("#alerts").find("p").html("curso insertado con id " + data.id);
			$("#alerts").show();
			$('#cursoModal').modal('toggle');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
		}
	});
	e.preventDefault();
}

function modificarCurso(e) {
	$.ajax({
		type: "PUT",
		url: "/modificaCurso",
		contentType: "application/json",
		data: JSON.stringify({
			id: $("id").val(),
			titulo: $("#titulo").val(),
			descripcion: $("#descripcion").val(),
			localidad: $("#localidad").val(),
			direccion: $("#direccion").val(),
			imagen: $("#mi-selector").val(),
			plazas: $("#plazas").val(),
			fecha_ini: $("#fecha_ini").val(),
			fecha_fin: $("#fecha_fin").val(),
			horario: $("#horarios_ini").val() + "-" + $("#horarios_fin").val()
			}),
		success: function(data, textStatus, jqXHR ) {
			$("#alerts").toggleClass('alert-warning alert-success');
			$("#alerts").find("p").html("curso insertado con id " + data.id);
			$("#alerts").show();
			$('#cursoModal').modal('toggle');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
		}
	});
	e.preventDefault();
}

function eliminarCurso() {

	var idCurso = $("#idEliminar").val();
	$.ajax({
		type: "DELETE",
		url: "/eliminarCurso",
		contentType: "application/json",
		data: JSON.stringify({ id: idCurso }),
		success: function(data, textStatus, jqXHR ) {
			$("#alerts").toggleClass('alert-warning alert-success');
			$("#alerts").find("p").html("El curso con id " + idCurso + " ha sido eliminado");
			$("#alerts").show();
			$('#cursoDeleteModal').modal('hide');
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").toggleClass("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
			$("alerts").show();
			$('#cursoDeleteModal').modal('hide');
		}
	});
}

function leerCurso() {
	var idCurso = $("#idLeer").val();
	$.ajax({
		type: "GET",
		url: "/leerCurso",
		accept: "application/json",
		data: { id: idCurso },
		success: function(data, textStatus, jqXHR ) {
			$('#cursoLeerModal').find('h4.modal-title').html(data.titulo);
			$('#cursoLeerModal').find('div.form-group').hide();
			$('#infoCurso').load('/rendInfoCurso', data);
			$('#bLeerCurso').hide();
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#cursoLeerModal").modal('hide');
			$("#alerts").toggleClass("alert-warning alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
			$("#alerts").show();
		}
	});
}

function printInfoCurso() {

}