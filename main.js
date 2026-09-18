document.addEventListener('DOMContentLoaded', () => {
    const formIngreso = document.getElementById('formIngreso');
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formRegistro');
    const formReceta = document.getElementById('formReceta');

    if (formIngreso) {
        formIngreso.addEventListener('submit', agregarPaciente);
    }

    if (formLogin) {
        formLogin.addEventListener('submit', iniciarSesion);
    }

    if (formRegistro) {
        formRegistro.addEventListener('submit', registrarMedico);
    }

    if (formReceta) {
        formReceta.addEventListener('submit', emitirReceta);
    }

    asociarEventosBotonesExistentes();
});

function agregarPaciente(event) {
    event.preventDefault();

    const dni = document.getElementById('dni').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const motivo = document.getElementById('motivo').value.trim();

    if (!dni || !nombre || !motivo) return;

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td class="fw-bold text-secondary">${horaActual}</td>
        <td>
            <strong>${nombre}</strong><br>
            <small class="text-muted">DNI: ${dni}</small>
        </td>
        <td>${motivo}</td>
        <td><span class="badge bg-warning text-dark">En espera</span></td>
        <td class="text-end">
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-primary btn-atender" title="Llamar a consulta">
                    <i class="bi bi-telephone-out"></i> Atender
                </button>
                <button type="button" class="btn btn-outline-danger btn-eliminar" title="Cancelar turno">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;

    nuevaFila.querySelector('.btn-atender').addEventListener('click', (e) => cambiarEstadoPaciente(e.currentTarget));
    nuevaFila.querySelector('.btn-eliminar').addEventListener('click', (e) => eliminarPaciente(e.currentTarget));

    const tablaEsperaBody = document.querySelector('#tablaEspera tbody');
    tablaEsperaBody.appendChild(nuevaFila);

    document.getElementById('formIngreso').reset();
    actualizarContadorPacientes();
}

function cambiarEstadoPaciente(boton) {
    const fila = boton.closest('tr');
    const celdaEstado = fila.children[3];
    const badge = celdaEstado.querySelector('.badge');

    if (badge.classList.contains('bg-warning')) {
        badge.className = 'badge bg-info text-dark';
        badge.textContent = 'En atención';
        boton.innerHTML = '<i class="bi bi-check-lg"></i> Finalizar';
        boton.classList.replace('btn-outline-primary', 'btn-outline-success');
    } else if (badge.classList.contains('bg-info')) {
        badge.className = 'badge bg-success';
        badge.textContent = 'Atendido';
        boton.disabled = true;
        boton.innerHTML = '<i class="bi bi-check-all"></i> Finalizado';
    }
}

function eliminarPaciente(boton) {
    const fila = boton.closest('tr');
    fila.remove();
    actualizarContadorPacientes();
}

function asociarEventosBotonesExistentes() {
    document.querySelectorAll('.btn-atender').forEach(boton => {
        boton.addEventListener('click', (e) => cambiarEstadoPaciente(e.currentTarget));
    });

    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', (e) => eliminarPaciente(e.currentTarget));
    });

    actualizarContadorPacientes();
}

function actualizarContadorPacientes() {
    const contador = document.getElementById('contadorPacientes');
    const total = document.querySelectorAll('#tablaEspera tbody tr').length;
    if (contador) {
        contador.textContent = `${total} paciente${total !== 1 ? 's' : ''}`;
    }
}

function iniciarSesion(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (usuario === 'admin' && pass === 'admin123') {
        alert('¡Bienvenido al sistema, Dr. Administrador!');
        ocultarModalLogin();
    } else {
        alert('Credenciales incorrectas. Intente con usuario: admin / contraseña: admin123');
    }
}

function registrarMedico(event) {
    event.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const matricula = document.getElementById('regMatricula').value.trim();

    if (nombre && matricula) {
        alert(`¡Registro exitoso! Cuenta médica creada para ${nombre} (${matricula}). Ya puede iniciar sesión.`);
        document.getElementById('formRegistro').reset();
        ocultarModalLogin();
    }
}

function emitirReceta(event) {
    event.preventDefault();
    const paciente = document.getElementById('pacienteReceta').value.trim();
    const medicamento = document.getElementById('medicamento').value.trim();
    const medico = document.getElementById('medicoFirma').value;

    if (paciente && medicamento && medico) {
        alert(` Receta Digital Emitida con Éxito\n\nPaciente: ${paciente}\nMedicamento: ${medicamento}\nFirmado por: ${medico}\nDocumento enviado por vía remota.`);
        document.getElementById('formReceta').reset();
    }
}

function ocultarModalLogin() {
    const modalElement = document.getElementById('loginModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
}