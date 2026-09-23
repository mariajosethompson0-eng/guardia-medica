/**
 * GUARDIASAPP - INTERACTIVIDAD COMPLETA DE BOTONES Y DOM
 */

// Pacientes de prueba iniciales
let listaPacientes = [
    { id: 1, hora: '09:15', dni: '38123456', nombre: 'María Thompson', motivo: 'Dolor precordial con disnea', triage: 'Rojo', estado: 'En Espera' },
    { id: 2, hora: '09:30', dni: '40987654', nombre: 'Juan Pérez', motivo: 'Fiebre alta y cefalea persistente', triage: 'Amarillo', estado: 'En Atención' },
    { id: 3, hora: '09:45', dni: '42111222', nombre: 'Lucas Benítez', motivo: 'Traumatismo leve en tobillo derecho', triage: 'Verde', estado: 'En Espera' }
];

let listaMedicos = [
    { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología | Mat. 45211', activo: true },
    { id: 2, nombre: 'Dra. Valeria Ríos', especialidad: 'Clínica Médica | Mat. 58920', activo: false }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPacientes();
    renderMedicos();
    conectarCalculadora();
    calcularRetribucion();

    // Submit Admisión
    const formAdmision = document.getElementById('formAdmision');
    if (formAdmision) {
        formAdmision.addEventListener('submit', (e) => {
            e.preventDefault();

            const dni = document.getElementById('dni').value.trim();
            const nombre = document.getElementById('nombre').value.trim();
            const triage = document.getElementById('triage').value;
            const motivo = document.getElementById('motivo').value.trim();
            const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            listaPacientes.unshift({
                id: Date.now(),
                hora: horaActual,
                dni,
                nombre,
                triage,
                motivo,
                estado: 'En Espera'
            });

            renderPacientes();
            formAdmision.reset();
            mostrarAlerta(`Paciente ${nombre} registrado exitosamente con Triage ${triage}.`);
        });
    }

    // Submit Login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUser').value.trim();
            ocultarModal('loginModal');
            mostrarAlerta(`Sesión iniciada como: ${user}`);
            formLogin.reset();
        });
    }
});

// Renderizar tabla buscando cualquier posible contenedor en el DOM
function renderPacientes() {
    const tbody = document.getElementById('tablaPacientesBody') || 
                  document.getElementById('tablaPacientes') || 
                  document.querySelector('tbody');

    if (!tbody) return;

    if (listaPacientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary py-4"><i class="bi bi-inbox fs-3 d-block mb-1"></i> No hay pacientes en la sala.</td></tr>`;
        actualizarContadores();
        return;
    }

    tbody.innerHTML = listaPacientes.map(p => {
        let badgeTriage = 'bg-success text-white';
        if (p.triage === 'Rojo') badgeTriage = 'bg-danger text-white';
        if (p.triage === 'Amarillo') badgeTriage = 'bg-warning text-dark';

        let badgeEstado = 'bg-secondary';
        if (p.estado === 'En Espera') badgeEstado = 'bg-warning text-dark';
        if (p.estado === 'En Atención') badgeEstado = 'bg-info text-dark';
        if (p.estado === 'Atendido') badgeEstado = 'bg-success text-white';

        let botonesAccion = '';
        if (p.estado === 'En Espera') {
            botonesAccion = `<button type="button" class="btn btn-sm btn-outline-primary" onclick="cambiarEstadoPaciente(${p.id}, 'En Atención')"><i class="bi bi-play-fill me-1"></i> Atender</button>`;
        } else if (p.estado === 'En Atención') {
            botonesAccion = `<button type="button" class="btn btn-sm btn-outline-success" onclick="cambiarEstadoPaciente(${p.id}, 'Atendido')"><i class="bi bi-check2-all me-1"></i> Finalizar</button>`;
        } else {
            botonesAccion = `<span class="text-success fw-bold fs-7 me-2"><i class="bi bi-check-circle-fill me-1"></i> Atendido</span>`;
        }

        return `
            <tr>
                <td class="fw-bold text-secondary">${p.hora}</td>
                <td>
                    <div class="fw-bold text-light">${p.nombre}</div>
                    <small class="text-secondary">DNI: ${p.dni}</small>
                    <div class="fs-7 text-secondary mt-1">${p.motivo}</div>
                </td>
                <td><span class="badge ${badgeTriage} rounded-pill px-2.5 py-1">🔴 ${p.triage}</span></td>
                <td><span class="badge ${badgeEstado}">${p.estado}</span></td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        ${botonesAccion}
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarPaciente(${p.id})"><i class="bi bi-trash-fill"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    actualizarContadores();
}

// Renderizar Médicos
function renderMedicos() {
    const container = document.getElementById('contenedorMedicos');
    if (!container) return;

    container.innerHTML = listaMedicos.map(m => `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-dark ${m.activo ? 'card-doctor-active' : 'card-doctor-descanso'} p-3 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="bg-info bg-opacity-10 text-cyan p-3 rounded-circle">
                            <i class="bi bi-person-fill fs-2"></i>
                        </div>
                        <div>
                            <h3 class="h6 fw-bold text-light mb-0">${m.nombre}</h3>
                            <small class="text-secondary">${m.especialidad}</small>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge ${m.activo ? 'bg-success' : 'bg-warning text-dark'}">${m.activo ? 'En Guardia Activa' : 'En Descanso'}</span>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" onclick="toggleEstadoMedico(${m.id})">Cambiar Estado</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const countMedicos = document.getElementById('navCountMedicos');
    if (countMedicos) countMedicos.textContent = listaMedicos.filter(m => m.activo).length;
}

// Funciones globales
window.cambiarEstadoPaciente = function(id, nuevoEstado) {
    const p = listaPacientes.find(item => item.id === id);
    if (p) {
        p.estado = nuevoEstado;
        renderPacientes();
    }
};

window.eliminarPaciente = function(id) {
    listaPacientes = listaPacientes.filter(item => item.id !== id);
    renderPacientes();
};

window.toggleEstadoMedico = function(id) {
    const m = listaMedicos.find(item => item.id === id);
    if (m) {
        m.activo = !m.activo;
        renderMedicos();
    }
};

window.agregarNuevoMedico = function() {
    const nombre = prompt('Nombre completo del profesional:');
    const especialidad = prompt('Especialidad y Matrícula:');
    if (nombre && especialidad) {
        listaMedicos.push({ id: Date.now(), nombre, especialidad, activo: true });
        renderMedicos();
    }
};

window.activarTabCalculadora = function() {
    const btnTab = document.getElementById('btnTabCalculadora');
    if (btnTab && typeof bootstrap !== 'undefined') {
        const tab = new bootstrap.Tab(btnTab);
        tab.show();
        btnTab.scrollIntoView({ behavior: 'smooth' });
    }
};

function conectarCalculadora() {
    const cantGuardias = document.getElementById('cantGuardias');
    const perfil = document.getElementById('perfilProfesional');
    const tipo = document.getElementById('tipoGuardia');
    const precio = document.getElementById('precioHora');

    if (cantGuardias) {
        cantGuardias.addEventListener('input', () => {
            const numVal = document.getElementById('numGuardiasVal');
            if (numVal) numVal.textContent = cantGuardias.value;
            calcularRetribucion();
        });
    }
    if (perfil) {
        perfil.addEventListener('change', () => {
            if (perfil.value === 'Facultativo') precio.value = 28.50;
            if (perfil.value === 'MIR') precio.value = 18.00;
            if (perfil.value === 'Enfermeria') precio.value = 22.00;
            calcularRetribucion();
        });
    }
    if (tipo) tipo.addEventListener('change', calcularRetribucion);
    if (precio) precio.addEventListener('input', calcularRetribucion);
}

function calcularRetribucion() {
    const cant = parseInt(document.getElementById('cantGuardias')?.value) || 0;
    const tipo = document.getElementById('tipoGuardia')?.value;
    const precio = parseFloat(document.getElementById('precioHora')?.value) || 0;

    const horasTotales = cant * ((tipo === '24h') ? 24 : 12);
    const complemento = horasTotales * precio;
    const totalBruto = 2500 + complemento;

    const elHoras = document.getElementById('calcHorasTotales');
    const elComp = document.getElementById('calcComplemento');
    const elTotal = document.getElementById('calcTotalBruto');

    if (elHoras) elHoras.textContent = `${horasTotales} hrs`;
    if (elComp) elComp.textContent = `$${complemento.toFixed(2)}`;
    if (elTotal) elTotal.textContent = `$${totalBruto.toFixed(2)}`;
}

function actualizarContadores() {
    const total = listaPacientes.length;
    const rojos = listaPacientes.filter(p => p.triage === 'Rojo' && p.estado === 'En Espera').length;
    const espera = listaPacientes.filter(p => p.estado === 'En Espera').length;

    const contadorPacientes = document.getElementById('contadorPacientes');
    const navRojo = document.getElementById('navCountRojo');
    const navEspera = document.getElementById('navCountEspera');

    if (contadorPacientes) contadorPacientes.textContent = `${total} Pacientes Activos`;
    if (navRojo) navRojo.textContent = rojos;
    if (navEspera) navEspera.textContent = espera;
}

function mostrarAlerta(msg) {
    const box = document.getElementById('alertaGlobal');
    const txt = document.getElementById('alertaTexto');
    if (box && txt) {
        txt.textContent = msg;
        box.classList.remove('d-none');
        setTimeout(() => box.classList.add('d-none'), 3500);
    }
}

function ocultarModal(idModal) {
    const modalEl = document.getElementById(idModal);
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
}