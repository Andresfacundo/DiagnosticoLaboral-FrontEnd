import axios from "axios";

const API_URL = "http://localhost:3000";

export const obtenerPreguntas = async () => {
    const response = await axios.get(`${API_URL}/preguntas`);
    return response.data;
};

export const agregarPregunta = async (nuevaPregunta) => {
    const response = await axios.post(`${API_URL}/preguntas`, nuevaPregunta);
    return response.data;
};

export const eliminarPregunta = async (id) => {
    await axios.delete(`${API_URL}/preguntas/${id}`);
};

export const obtenerDiagnostico = async () => {
    const response = await axios.get(`${API_URL}/diagnostico`);
    return response.data;
};
