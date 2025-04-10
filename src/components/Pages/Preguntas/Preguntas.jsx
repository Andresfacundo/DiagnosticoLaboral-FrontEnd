import { useState, useEffect } from "react";
import axios from "axios";
import './Preguntas.css'

const API_URL = import.meta.env.VITE_API_URL

const Preguntas = () => {
    const [preguntas, setPreguntas] = useState([]);
    const [texto, setTexto] = useState("");
    const [peso, setPeso] = useState("");
    const [categoria, setCategoria] = useState("");
    const [editandoEnLinea, setEditandoEnLinea] = useState({});
    const [error, setError] = useState("");

    // Valores predeterminados para respuestas
    const tiposRespuestas = ["Si", "Si parcialmente", "No", "N/A"];
    
    // Lista de categorías disponibles
    const categorias = [
        "Colectivo",
        "Contratación",
        "Litigios",
        "Normas laborales",
        "Remunaración",
        "Documentación",
        "Seguridad social",
        "SST",
        "Terceros"
    ];

    // Obtener preguntas desde el backend
    useEffect(() => {
        obtenerPreguntas();
    }, []);

    const obtenerPreguntas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/preguntas`);
            setPreguntas(response.data);
        } catch (error) {
            console.error("Error al obtener preguntas", error);
            setError("No se pudieron cargar las preguntas. Intente nuevamente.");
        }
    };

    // Agregar una nueva pregunta - solo enviamos datos básicos, el backend calcula respuestas
    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError("");

        if (!texto.trim()) {
            setError("El texto de la pregunta es obligatorio");
            return;
        }

        if (!peso || isNaN(Number(peso)) || Number(peso) <= 0) {
            setError("El peso debe ser un número positivo");
            return;
        }

        if (!categoria) {
            setError("Debe seleccionar una categoría");
            return;
        }

        try {
            // Solo enviamos los campos básicos, el backend calculará las respuestas
            const response = await axios.post(`${API_URL}/api/preguntas`, {
                texto: texto.trim(),
                peso: Number(peso),
                categoria: categoria
            });
            
            setPreguntas([...preguntas, response.data]);
            setTexto("");
            setPeso("");
            setCategoria("");
        } catch (error) {
            console.error("Error en la operación", error);
            setError("No se pudo completar la operación. Intente nuevamente.");
        }
    };

    // Eliminar una pregunta
    const eliminarPregunta = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/preguntas/${id}`);
            setPreguntas(preguntas.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar pregunta", error);
            setError("No se pudo eliminar la pregunta. Intente nuevamente.");
        }
    };

    // Iniciar edición en línea
    const iniciarEdicionEnLinea = (pregunta) => {
        setEditandoEnLinea({
            id: pregunta.id,
            texto: pregunta.texto,
            peso: pregunta.peso.toString(),
            categoria: pregunta.categoria,
            // Usamos directamente los valores de respuesta que vienen del backend
            respuestas: {
                Si: pregunta.respuestas.Si.toString(),
                "Si parcialmente": pregunta.respuestas["Si parcialmente"].toString(),
                No: pregunta.respuestas.No.toString(),
                "N/A": pregunta.respuestas["N/A"].toString()
            }
        });
    };

    // Manejar cambios en los campos de edición
    const cambiarCampoEdicion = (campo, valor) => {
        setEditandoEnLinea({
            ...editandoEnLinea,
            [campo]: valor
        });
    };

    // Manejar cambios en los valores de respuesta
    const cambiarValorRespuesta = (tipo, valor) => {
        setEditandoEnLinea({
            ...editandoEnLinea,
            respuestas: {
                ...editandoEnLinea.respuestas,
                [tipo]: valor
            }
        });
    };

    // Guardar cambios de edición en línea
    const guardarEdicionEnLinea = async (id) => {
        if (!editandoEnLinea.texto.trim()) {
            setError("El texto de la pregunta es obligatorio");
            return;
        }

        if (editandoEnLinea.peso.trim() === "" || isNaN(Number(editandoEnLinea.peso)) || Number(editandoEnLinea.peso) <= 0) {
            setError("El peso debe ser un número positivo");
            return;
        }

        if (!editandoEnLinea.categoria) {
            setError("Debe seleccionar una categoría");
            return;
        }

        // Validar valores de respuesta
        for (const tipo of tiposRespuestas) {
            const valor = editandoEnLinea.respuestas[tipo];
            if (valor.trim() === "" || isNaN(Number(valor))) {
                setError(`El valor para la respuesta "${tipo}" debe ser un número válido`);
                return;
            }
        }

        try {
            // Convertir valores de respuesta a números
            const respuestasNumero = {};
            for (const tipo of tiposRespuestas) {
                respuestasNumero[tipo] = Number(editandoEnLinea.respuestas[tipo]);
            }

            // Enviamos los datos al backend
            const response = await axios.put(`${API_URL}/api/preguntas/${id}`, {
                texto: editandoEnLinea.texto.trim(),
                peso: Number(editandoEnLinea.peso),
                categoria: editandoEnLinea.categoria,
                respuestas: respuestasNumero
            });

            // Actualizamos la pregunta con la respuesta del backend
            setPreguntas(preguntas.map(p => p.id === id ? response.data : p));
            setEditandoEnLinea({});
            setError("");
        } catch (error) {
            console.error("Error al actualizar pregunta", error);
            setError("No se pudo actualizar la pregunta. Intente nuevamente.");
        }
    };

    // Cancelar edición en línea
    const cancelarEdicionEnLinea = () => {
        setEditandoEnLinea({});
        setError("");
    };

    return (
        <div className="preguntas-container">
            <h2 className="preguntas-header">Gestión de Preguntas</h2>

            {/* Formulario para agregar nuevas preguntas */}
            <form onSubmit={manejarEnvio} className="preguntas-form">
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <input 
                    type="text" 
                    placeholder="Nueva Pregunta" 
                    value={texto} 
                    onChange={(e) => setTexto(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Peso (0-3)" 
                    value={peso} 
                    onChange={(e) => setPeso(e.target.value)} 
                    min="0" 
                    max='3' 
                    step='any' 
                    required 
                />
                <select 
                    className="select-categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                >
                    <option value="" disabled>Seleccione una categoría</option>
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button type="submit">Agregar Nueva Pregunta</button>
            </form>

            {/* Lista de preguntas */}
            {preguntas.length === 0 ? (
                <p>No hay preguntas. Agregue una nueva.</p>
            ) : (
                <>
                    <div className="preguntas-list-header">
                        <div>#</div>
                        <div>Pregunta</div>
                        <div>Peso</div>
                        <div>Categoria</div>
                        <div>Acciones</div>
                    </div>
                    <ul className="preguntas-list">
                        {preguntas.map((pregunta, index) => (
                            <li key={pregunta.id} className="preguntas-item">
                                <div className="gestionar-preguntas">
                                    <div className="preguntas-item-number">{index + 1}</div>

                                    {editandoEnLinea.id === pregunta.id ? (
                                        // Modo de edición en línea
                                        <>
                                            <div className="preguntas-item-text">
                                                <input
                                                    type="text"
                                                    value={editandoEnLinea.texto}
                                                    onChange={(e) => cambiarCampoEdicion('texto', e.target.value)}
                                                    className="editar-en-linea-input"
                                                />
                                            </div>
                                            <div className="preguntas-item-peso">
                                                <input
                                                    type="text"
                                                    value={editandoEnLinea.peso}
                                                    onChange={(e) => cambiarCampoEdicion('peso', e.target.value)}
                                                    className="editar-en-linea-input peso"
                                                />
                                            </div>
                                            <div className="preguntas-item-categoria">
                                                <select
                                                    value={editandoEnLinea.categoria}
                                                    onChange={(e) => cambiarCampoEdicion('categoria', e.target.value)}
                                                    className="editar-en-linea-input"
                                                >
                                                    {categorias.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="preguntas-item-actions">
                                                <button
                                                    onClick={() => guardarEdicionEnLinea(pregunta.id)}
                                                    className="btn-guardar"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={cancelarEdicionEnLinea}
                                                    className="btn-cancelar"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        // Modo de visualización normal
                                        <>
                                            <div className="preguntas-item-text">{pregunta.texto}</div>
                                            <div className="preguntas-item-peso">{pregunta.peso}</div>
                                            <div className="preguntas-item-categoria">{pregunta.categoria}</div>
                                            <div className="preguntas-item-actions">
                                                <button
                                                    onClick={() => iniciarEdicionEnLinea(pregunta)}
                                                    className="btn-editar"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => eliminarPregunta(pregunta.id)}
                                                    className="btn-eliminar"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="content-response">
                                    <p>Respuestas</p>
                                    <div className="content-response-items">
                                        {editandoEnLinea.id === pregunta.id ? (
                                            // Modo de edición para valores de respuesta
                                            <>
                                                {tiposRespuestas.map((tipo) => (
                                                    <div key={tipo} className={`respuesta ${tipo.toLowerCase().replace(" ", "-")}`}>
                                                        {tipo} <br />
                                                        <input
                                                            type="text"
                                                            value={editandoEnLinea.respuestas[tipo]}
                                                            onChange={(e) => cambiarValorRespuesta(tipo, e.target.value)}
                                                            className="editar-en-linea-input respuesta-input"
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            // Modo de visualización normal para respuestas
                                            <>
                                                <div className="respuesta si">Si <br /> {pregunta.respuestas.Si}</div>
                                                <div className="respuesta si-parcialmente">Si parcialmente <br /> {pregunta.respuestas["Si parcialmente"]}</div>
                                                <div className="respuesta no">No <br /> {pregunta.respuestas.No}</div>
                                                <div className="respuesta na">N/A <br /> {pregunta.respuestas["N/A"]}</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default Preguntas;