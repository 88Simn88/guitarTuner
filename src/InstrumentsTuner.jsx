import React, { useEffect, useState } from "react";
import PitchFinder from "pitchfinder";

export default function InstrumentsTuner() {
    const [frequency, setFrequency] = useState(null);
    const [isRecording, setIsRecording] = useState(false); // Estado para el micrófono
    const targetFrequencies = {
        E6: 82,
        A: 110,
        D: 147,
        G: 196,
        B: 247,
        E1: 330,
    };

    // Función para activar el micrófono cuando se presiona el botón
    const getMicrophoneAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            const detectPitch = PitchFinder.AMDF();
            const buffer = new Float32Array(analyser.fftSize);

            const analyze = () => {
                analyser.getFloatTimeDomainData(buffer);
                const pitch = detectPitch(buffer);
                if (pitch) setFrequency(pitch);
                requestAnimationFrame(analyze);
            };

            analyze();
            setIsRecording(true); // Indica que el micrófono está activo
        } catch (err) {
            console.error("Error al acceder al micrófono:", err);
        }
    };

    return (
        <div>
            <h1>Afinador de Guitarra</h1>
            <p>Frecuencia detectada: {frequency ? `${frequency.toFixed(2)} Hz` : 'No detectada'}</p>
            <p>{frequency && getTuningStatus(frequency, targetFrequencies)}</p>

            {/* Botón para activar/desactivar el micrófono */}
            <button onClick={getMicrophoneAccess} disabled={isRecording}>
                {isRecording ? 'Micrófono Activado' : 'Activar Micrófono'}
            </button>
        </div>
    );
}

// Función auxiliar para verificar el estado de afinación
function getTuningStatus(frequency, targets) {
    for (const [string, targetFreq] of Object.entries(targets)) {
        if (Math.abs(frequency - targetFreq) < 2) {
            return `Cuerda ${string} está afinada!`;
        }
    }
    return "Ajusta la afinación";
}
