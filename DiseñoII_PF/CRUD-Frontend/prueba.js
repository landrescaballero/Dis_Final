Swal.fire({
    title: "Usuario creado exitosamente",
    html: `El usuario <strong>${data.numero_documento}</strong> ha sido creado exitosamente.`,
    icon: "success",
    confirmButtonText: "Aceptar",
  });