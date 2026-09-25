/**
 * GUARDIASAPP
 * Sistema de roles:
 *
 * administrador
 * recepcionista
 * medico
 */


// ======================================================
// USUARIOS DE PRUEBA
// ======================================================

const usuariosDemo = {

    admin: {
        password: '1234',
        rol: 'administrador',
        nombre: 'Administrador'
    },

    recepcion: {
        password: '1234',
        rol: 'recepcionista',
        nombre: 'Recepcionista'
    },

    medico: {
        password: '1234',
        rol: 'medico',
        nombre: 'Médico'
    }

};


// ======================================================
// USUARIO ACTUAL
// ======================================================

let usuarioActual = null;


// ======================================================
// PACIENTES
// ======================================================

let listaPacientes = [

    {
        id: 1,
        hora: '09:15',
        dni: '38123456',
        nombre: 'María Thompson',
        motivo: 'Dolor precordial con disnea',
        triage: 'Rojo',
        estado: 'En Espera'
    },

    {
        id: 2,
        hora: '09:30',
        dni: '40987654',
        nombre: 'Juan Pérez',
        motivo: 'Fiebre alta y cefalea persistente',
        triage: 'Amarillo',
        estado: 'En Atención'
    },

    {
        id: 3,
        hora: '09:45',
        dni: '42111222',
        nombre: 'Lucas Benítez',
        motivo: 'Traumatismo leve en tobillo derecho',
        triage: 'Verde',
        estado: 'En Espera'
    }

];


// ======================================================
// MÉDICOS
// ======================================================

let listaMedicos = [

    {
        id: 1,
        nombre: 'Dr. Carlos Mendoza',
        especialidad: 'Cardiología | Mat. 45211',
        activo: true
    },

    {
        id: 2,
        nombre: 'Dra. Valeria Ríos',
        especialidad: 'Clínica Médica | Mat. 58920',
        activo: false
    }

];


// ======================================================
// INICIO
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    renderPacientes();

    renderMedicos();

    conectarCalculadora();

    calcularRetribucion();

    // Al comenzar, ocultamos las partes privadas
    aplicarPermisos();


    // ==================================================
    // REGISTRAR PACIENTE
    // ==================================================

    const formAdmision =
        document.getElementById('formAdmision');

    if (formAdmision) {

        formAdmision.addEventListener('submit', (e) => {

            e.preventDefault();


            if (!exigirRol(['recepcionista'])) {
                return;
            }


            const dni =
                document.getElementById('dni').value.trim();

            const nombre =
                document.getElementById('nombre').value.trim();

            const triage =
                document.getElementById('triage').value;

            const motivo =
                document.getElementById('motivo').value.trim();


            const horaActual =
                new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });


            listaPacientes.unshift({

                id: Date.now(),

                hora: horaActual,

                dni,

                nombre,

                motivo,

                triage,

                estado: 'En Espera'

            });


            renderPacientes();

            formAdmision.reset();


            mostrarAlerta(
                `Paciente ${nombre} registrado exitosamente con Triage ${triage}.`
            );

        });

    }


    // ==================================================
    // LOGIN
    // ==================================================

    const formLogin =
        document.getElementById('formLogin');


    if (formLogin) {

        formLogin.addEventListener('submit', (e) => {

            e.preventDefault();


            const user =
                document
                    .getElementById('loginUser')
                    .value
                    .trim()
                    .toLowerCase();


            const pass =
                document
                    .getElementById('loginPass')
                    .value;


            const cuenta =
                usuariosDemo[user];


            // Verificar usuario
            if (!cuenta || cuenta.password !== pass) {

                mostrarAlerta(
                    'Usuario o contraseña incorrectos.'
                );

                return;
            }


            // Guardar usuario
            usuarioActual = {

                usuario: user,

                rol: cuenta.rol,

                nombre: cuenta.nombre

            };


            // Aplicar permisos
            aplicarPermisos();


            // Cambiar botones de navegación
            document
                .getElementById('navAuth')
                ?.classList.add('d-none');


            document
                .getElementById('navSesion')
                ?.classList.remove('d-none');


            document
                .getElementById('rolActual')
                .textContent = cuenta.nombre;


            // Cerrar modal
            ocultarModal('loginModal');


            mostrarAlerta(
                `Sesión iniciada como: ${cuenta.nombre}`
            );


            formLogin.reset();

        });

    }

});


// ======================================================
// CONTROL DE ROLES
// ======================================================

function exigirRol(rolesPermitidos) {

    if (!usuarioActual) {

        mostrarAlerta(
            'Debe iniciar sesión para realizar esta acción.'
        );

        return false;
    }


    if (!rolesPermitidos.includes(usuarioActual.rol)) {

        mostrarAlerta(
            'No tiene permisos para realizar esta acción.'
        );

        return false;
    }


    return true;
}


// ======================================================
// MOSTRAR / OCULTAR ELEMENTOS SEGÚN EL ROL
// ======================================================

function aplicarPermisos() {

    const elementos =
        document.querySelectorAll('[data-role]');


    elementos.forEach(elemento => {

        const roles =
            elemento
                .getAttribute('data-role')
                .split(' ');


        // Si no hay sesión
        if (!usuarioActual) {

            elemento.classList.add('d-none');

            return;
        }


        // Mostrar únicamente si tiene permiso
        if (roles.includes(usuarioActual.rol)) {

            elemento.classList.remove('d-none');

        } else {

            elemento.classList.add('d-none');

        }

    });


    // Renderizamos nuevamente porque los botones
    // dependen del usuario
    renderPacientes();

    renderMedicos();

}


// ======================================================
// CERRAR SESIÓN
// ======================================================

window.cerrarSesion = function () {

    usuarioActual = null;


    document
        .getElementById('navAuth')
        ?.classList.remove('d-none');


    document
        .getElementById('navSesion')
        ?.classList.add('d-none');


    document
        .getElementById('rolActual')
        .textContent = '';


    aplicarPermisos();


    mostrarAlerta(
        'Sesión cerrada correctamente.'
    );

};


// ======================================================
// RENDERIZAR PACIENTES
// ======================================================

function renderPacientes() {

    const tbody =
        document.getElementById('tablaPacientesBody');


    if (!tbody) {
        return;
    }


    if (listaPacientes.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-secondary py-4">

                    <i class="bi bi-inbox fs-3 d-block mb-1"></i>

                    No hay pacientes en la sala.

                </td>
            </tr>
        `;


        actualizarContadores();

        return;
    }


    tbody.innerHTML =
        listaPacientes.map(p => {


            // ==========================================
            // TRIAGE
            // ==========================================

            let badgeTriage =
                'bg-success text-white';


            if (p.triage === 'Rojo') {

                badgeTriage =
                    'bg-danger text-white';

            }


            if (p.triage === 'Amarillo') {

                badgeTriage =
                    'bg-warning text-dark';

            }


            // ==========================================
            // ESTADO
            // ==========================================

            let badgeEstado =
                'bg-secondary';


            if (p.estado === 'En Espera') {

                badgeEstado =
                    'bg-warning text-dark';

            }


            if (p.estado === 'En Atención') {

                badgeEstado =
                    'bg-info text-dark';

            }


            if (p.estado === 'Atendido') {

                badgeEstado =
                    'bg-success text-white';

            }


            // ==========================================
            // BOTONES
            // ==========================================

            let botonesAccion = '';


            // RECEPCIONISTA Y MÉDICO
            if (
                usuarioActual &&
                (
                    usuarioActual.rol === 'recepcionista' ||
                    usuarioActual.rol === 'medico'
                )
            ) {

                if (p.estado === 'En Espera') {

                    botonesAccion = `

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            onclick="cambiarEstadoPaciente(${p.id}, 'En Atención')">

                            <i class="bi bi-play-fill me-1"></i>

                            Atender

                        </button>

                    `;

                }

                else if (p.estado === 'En Atención') {

                    botonesAccion = `

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-success"
                            onclick="cambiarEstadoPaciente(${p.id}, 'Atendido')">

                            <i class="bi bi-check2-all me-1"></i>

                            Finalizar

                        </button>

                    `;

                }

                else {

                    botonesAccion = `

                        <span class="text-success fw-bold fs-7 me-2">

                            <i class="bi bi-check-circle-fill me-1"></i>

                            Atendido

                        </span>

                    `;

                }

            }


            // ADMINISTRADOR
            if (
                usuarioActual &&
                usuarioActual.rol === 'administrador'
            ) {

                botonesAccion = `

                    <span class="text-secondary small">
                        Solo visualización
                    </span>

                `;

            }


            // SIN SESIÓN
            if (!usuarioActual) {

                botonesAccion = `

                    <span class="text-secondary small">
                        Inicie sesión
                    </span>

                `;

            }


            // BOTÓN ELIMINAR
            let botonEliminar = '';


            if (
                usuarioActual &&
                usuarioActual.rol === 'recepcionista'
            ) {

                botonEliminar = `

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick="eliminarPaciente(${p.id})">

                        <i class="bi bi-trash-fill"></i>

                    </button>

                `;

            }


            return `

                <tr>

                    <td class="fw-bold text-secondary">
                        ${p.hora}
                    </td>


                    <td>

                        <div class="fw-bold text-light">
                            ${p.nombre}
                        </div>

                        <small class="text-secondary">
                            DNI: ${p.dni}
                        </small>

                        <div class="fs-7 text-secondary mt-1">
                            ${p.motivo}
                        </div>

                    </td>


                    <td>

                        <span class="badge ${badgeTriage} rounded-pill px-2.5 py-1">

                            ${
                                p.triage === 'Rojo'
                                    ? '🔴'
                                    : p.triage === 'Amarillo'
                                    ? '🟡'
                                    : '🟢'
                            }

                            ${p.triage}

                        </span>

                    </td>


                    <td>

                        <span class="badge ${badgeEstado}">
                            ${p.estado}
                        </span>

                    </td>


                    <td class="text-end">

                        <div class="btn-group btn-group-sm">

                            ${botonesAccion}

                            ${botonEliminar}

                        </div>

                    </td>

                </tr>

            `;

        }).join('');


    actualizarContadores();

}


// ======================================================
// RENDERIZAR MÉDICOS
// ======================================================

function renderMedicos() {

    const container =
        document.getElementById('contenedorMedicos');


    if (!container) {
        return;
    }


    container.innerHTML =

        listaMedicos.map(m => {


            let botonEstado = '';


            // SOLO MÉDICO
            if (
                usuarioActual &&
                usuarioActual.rol === 'medico'
            ) {

                botonEstado = `

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary rounded-pill"
                        onclick="toggleEstadoMedico(${m.id})">

                        Cambiar Estado

                    </button>

                `;

            }


            // ADMINISTRADOR
            if (
                usuarioActual &&
                usuarioActual.rol === 'administrador'
            ) {

                botonEstado = `

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger rounded-pill"
                        onclick="darDeBajaMedico(${m.id})">

                        Dar de baja

                    </button>

                `;

            }


            return `

                <div class="col-12 col-md-6 col-lg-4">

                    <div class="card card-dark
                        ${
                            m.activo
                                ? 'card-doctor-active'
                                : 'card-doctor-descanso'
                        }
                        p-3 shadow-sm">

                        <div class="card-body">

                            <div class="d-flex align-items-center gap-3 mb-3">

                                <div class="bg-info bg-opacity-10 text-cyan p-3 rounded-circle">

                                    <i class="bi bi-person-fill fs-2"></i>

                                </div>


                                <div>

                                    <h3 class="h6 fw-bold text-light mb-0">

                                        ${m.nombre}

                                    </h3>

                                    <small class="text-secondary">

                                        ${m.especialidad}

                                    </small>

                                </div>

                            </div>


                            <div class="d-flex justify-content-between align-items-center">

                                <span class="badge ${
                                    m.activo
                                        ? 'bg-success'
                                        : 'bg-warning text-dark'
                                }">

                                    ${
                                        m.activo
                                            ? 'En Guardia Activa'
                                            : 'En Descanso'
                                    }

                                </span>


                                ${botonEstado}

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }).join('');


    const countMedicos =
        document.getElementById('navCountMedicos');


    if (countMedicos) {

        countMedicos.textContent =
            listaMedicos.filter(m => m.activo).length;

    }

}


// ======================================================
// CAMBIAR ESTADO DEL PACIENTE
// ======================================================

window.cambiarEstadoPaciente =
    function(id, nuevoEstado) {


        if (
            !exigirRol([
                'recepcionista',
                'medico'
            ])
        ) {

            return;

        }


        const paciente =
            listaPacientes.find(
                item => item.id === id
            );


        if (paciente) {

            paciente.estado =
                nuevoEstado;


            renderPacientes();


            mostrarAlerta(
                `Estado de ${paciente.nombre} cambiado a ${nuevoEstado}.`
            );

        }

    };


// ======================================================
// ELIMINAR PACIENTE
// ======================================================

window.eliminarPaciente =
    function(id) {


        if (
            !exigirRol([
                'recepcionista'
            ])
        ) {

            return;

        }


        listaPacientes =
            listaPacientes.filter(
                item => item.id !== id
            );


        renderPacientes();


        mostrarAlerta(
            'Paciente eliminado de la lista.'
        );

    };


// ======================================================
// CAMBIAR ESTADO MÉDICO
// ======================================================

window.toggleEstadoMedico =
    function(id) {


        if (
            !exigirRol([
                'medico'
            ])
        ) {

            return;

        }


        const medico =
            listaMedicos.find(
                item => item.id === id
            );


        if (medico) {

            medico.activo =
                !medico.activo;


            renderMedicos();


            mostrarAlerta(
                `${medico.nombre} ahora está ${
                    medico.activo
                        ? 'en guardia activa'
                        : 'en descanso'
                }.`
            );

        }

    };


// ======================================================
// AGREGAR MÉDICO
// ======================================================

window.agregarNuevoMedico =
    function() {


        if (
            !exigirRol([
                'administrador'
            ])
        ) {

            return;

        }


        const nombre =
            prompt(
                'Nombre completo del profesional:'
            );


        const especialidad =
            prompt(
                'Especialidad y Matrícula:'
            );


        if (nombre && especialidad) {

            listaMedicos.push({

                id: Date.now(),

                nombre,

                especialidad,

                activo: true

            });


            renderMedicos();


            mostrarAlerta(
                `Profesional ${nombre} registrado correctamente.`
            );

        }

    };


// ======================================================
// DAR DE BAJA MÉDICO
// ======================================================

window.darDeBajaMedico =
    function(id) {


        if (
            !exigirRol([
                'administrador'
            ])
        ) {

            return;

        }


        const medico =
            listaMedicos.find(
                item => item.id === id
            );


        if (!medico) {
            return;
        }


        const confirmar =
            confirm(
                `¿Desea dar de baja a ${medico.nombre}?`
            );


        if (!confirmar) {
            return;
        }


        listaMedicos =
            listaMedicos.filter(
                item => item.id !== id
            );


        renderMedicos();


        mostrarAlerta(
            `${medico.nombre} fue dado de baja.`
        );

    };


// ======================================================
// CALCULADORA
// ======================================================

window.activarTabCalculadora =
    function() {


        if (
            !exigirRol([
                'administrador'
            ])
        ) {

            return;

        }


        const btnTab =
            document.getElementById(
                'btnTabCalculadora'
            );


        if (
            btnTab &&
            typeof bootstrap !== 'undefined'
        ) {

            const tab =
                new bootstrap.Tab(btnTab);


            tab.show();


            btnTab.scrollIntoView({
                behavior: 'smooth'
            });

        }

    };


// ======================================================
// CONECTAR CALCULADORA
// ======================================================

function conectarCalculadora() {

    const cantGuardias =
        document.getElementById(
            'cantGuardias'
        );


    const perfil =
        document.getElementById(
            'perfilProfesional'
        );


    const tipo =
        document.getElementById(
            'tipoGuardia'
        );


    const precio =
        document.getElementById(
            'precioHora'
        );


    if (cantGuardias) {

        cantGuardias.addEventListener(
            'input',
            () => {

                const numVal =
                    document.getElementById(
                        'numGuardiasVal'
                    );


                if (numVal) {

                    numVal.textContent =
                        cantGuardias.value;

                }


                calcularRetribucion();

            }
        );

    }


    if (perfil) {

        perfil.addEventListener(
            'change',
            () => {


                if (
                    perfil.value ===
                    'Facultativo'
                ) {

                    precio.value =
                        28.50;

                }


                if (
                    perfil.value ===
                    'MIR'
                ) {

                    precio.value =
                        18.00;

                }


                if (
                    perfil.value ===
                    'Enfermeria'
                ) {

                    precio.value =
                        22.00;

                }


                calcularRetribucion();

            }
        );

    }


    if (tipo) {

        tipo.addEventListener(
            'change',
            calcularRetribucion
        );

    }


    if (precio) {

        precio.addEventListener(
            'input',
            calcularRetribucion
        );

    }

}


// ======================================================
// CALCULAR RETRIBUCIÓN
// ======================================================

function calcularRetribucion() {

    const cant =
        parseInt(
            document
                .getElementById('cantGuardias')
                ?.value
        ) || 0;


    const tipo =
        document
            .getElementById('tipoGuardia')
            ?.value;


    const precio =
        parseFloat(
            document
                .getElementById('precioHora')
                ?.value
        ) || 0;


    const horasTotales =
        cant *
        (
            tipo === '24h'
                ? 24
                : 12
        );


    const complemento =
        horasTotales *
        precio;


    const totalBruto =
        2500 +
        complemento;


    const elHoras =
        document.getElementById(
            'calcHorasTotales'
        );


    const elComp =
        document.getElementById(
            'calcComplemento'
        );


    const elTotal =
        document.getElementById(
            'calcTotalBruto'
        );


    if (elHoras) {

        elHoras.textContent =
            `${horasTotales} hrs`;

    }


    if (elComp) {

        elComp.textContent =
            `$${complemento.toFixed(2)}`;

    }


    if (elTotal) {

        elTotal.textContent =
            `$${totalBruto.toFixed(2)}`;

    }

}


// ======================================================
// CONTADORES
// ======================================================

function actualizarContadores() {

    const total =
        listaPacientes.length;


    const rojos =
        listaPacientes.filter(
            p =>
                p.triage === 'Rojo' &&
                p.estado === 'En Espera'
        ).length;


    const espera =
        listaPacientes.filter(
            p =>
                p.estado === 'En Espera'
        ).length;


    const contadorPacientes =
        document.getElementById(
            'contadorPacientes'
        );


    const navRojo =
        document.getElementById(
            'navCountRojo'
        );


    const navEspera =
        document.getElementById(
            'navCountEspera'
        );


    if (contadorPacientes) {

        contadorPacientes.textContent =
            `${total} Pacientes Activos`;

    }


    if (navRojo) {

        navRojo.textContent =
            rojos;

    }


    if (navEspera) {

        navEspera.textContent =
            espera;

    }

}


// ======================================================
// ALERTAS
// ======================================================

function mostrarAlerta(msg) {

    const box =
        document.getElementById(
            'alertaGlobal'
        );


    const txt =
        document.getElementById(
            'alertaTexto'
        );


    if (box && txt) {

        txt.textContent =
            msg;


        box.classList.remove(
            'd-none'
        );


        setTimeout(
            () => {

                box.classList.add(
                    'd-none'
                );

            },
            3500
        );

    }

}


// ======================================================
// OCULTAR MODAL
// ======================================================

function ocultarModal(idModal) {

    const modalEl =
        document.getElementById(
            idModal
        );


    if (
        modalEl &&
        typeof bootstrap !== 'undefined'
    ) {

        const modal =
            bootstrap.Modal
                .getInstance(modalEl);


        if (modal) {

            modal.hide();

        }

    }

}