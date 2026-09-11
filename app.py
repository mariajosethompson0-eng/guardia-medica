from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__, template_folder='app/templates')
app.config['SECRET_KEY'] = 'clave-secreta-guardia-medica'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///guardia.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = 'index'

# Modelos
class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), default='medico')

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(20), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    motivo = db.Column(db.Text, nullable=False)
    hora_ingreso = db.Column(db.String(10), nullable=False)
    estado = db.Column(db.String(20), default='En Espera')

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Rutas
@app.route('/')
def index():
    pacientes = Paciente.query.order_by(Paciente.id.desc()).all()
    return render_template('index.html', pacientes=pacientes)

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    usuario = Usuario.query.filter_by(username=username).first()
    if usuario and check_password_hash(usuario.password, password):
        login_user(usuario)
        flash('Inicio de sesión exitoso.', 'success')
    else:
        flash('Usuario o contraseña incorrectos.', 'danger')
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    logout_user()
    flash('Sesión cerrada correctamente.', 'info')
    return redirect(url_for('index'))

@app.route('/ingreso', methods=['POST'])
def ingreso_paciente():
    dni = request.form.get('dni')
    nombre = request.form.get('nombre')
    motivo = request.form.get('motivo')
    
    hora_actual = datetime.now().strftime('%H:%M')
    
    nuevo_paciente = Paciente(
        dni=dni,
        nombre=nombre,
        motivo=motivo,
        hora_ingreso=hora_actual
    )
    
    db.session.add(nuevo_paciente)
    db.session.commit()
    flash('Paciente registrado con éxito en la sala de espera.', 'success')
    return redirect(url_for('index'))

# Nueva Ruta: Cambiar estado del paciente (En Espera / En Atención / Atendido)
@app.route('/cambiar_estado/<int:paciente_id>/<string:nuevo_estado>')
def cambiar_estado(paciente_id, nuevo_estado):
    paciente = Paciente.query.get_or_404(paciente_id)
    paciente.estado = nuevo_estado
    db.session.commit()
    flash(f'Estado del paciente {paciente.nombre} actualizado a "{nuevo_estado}".', 'info')
    return redirect(url_for('index'))

# Nueva Ruta: Eliminar paciente
@app.route('/eliminar_paciente/<int:paciente_id>', methods=['POST'])
def eliminar_paciente(paciente_id):
    paciente = Paciente.query.get_or_404(paciente_id)
    db.session.delete(paciente)
    db.session.commit()
    flash(f'Paciente {paciente.nombre} eliminado de la lista.', 'warning')
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Usuario.query.filter_by(username='admin').first():
            hashed_pw = generate_password_hash('admin123')
            admin = Usuario(username='admin', password=hashed_pw, rol='admin')
            db.session.add(admin)
            db.session.commit()
    app.run(debug=True)