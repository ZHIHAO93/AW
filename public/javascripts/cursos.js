"use strict";

$(document).ready(function() {
	console.log("DOM inicializado");

	$("#alerts").hide();

	$("#tablaBusqueda").hide();

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

	$("#logModal").on('hidden.bs.modal', function() {
		$(this).find("input").val('').end();
	})

	$("#nuevaCuenta").on("click", nuevaCuenta);

	$("#formNuevoUsuario").on("submit", nuevoUsuario);

});

function busqueda(e) {
	$("#tablaBusqueda").find("tbody").empty();
	$.ajax({
		type: "GET",
		url: "/busqueda",
		data: {
			str: $("#buscarPalabra").val(),
			num: 3,
			pos: 2},
		success: function(data, textStatus, jqXHR ) {
			$("#tablaBusqueda").show();
			data.forEach(function(curso) {
				$("#tablaBusqueda").find("tbody").append(
					$("<tr>")
						.append($("<td>").text(curso.titulo))
						.append($("<td>").text(curso.localidad))
						.append($("<td>").text(curso.fecha_ini))
						.append($("<td>").text(curso.fecha_fin)
					)
				);
			});
		},
		error: function(jqXHR, textStatus, errorThrown ) {
			$("#alerts").attr("alert-warning", "alert-danger");
			$("#alerts").find("p").html("Se ha producido un error: " + errorThrown + textStatus);
		}
	});
	e.preventDefault();
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

}