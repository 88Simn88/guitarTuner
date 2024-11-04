import React, { useEffect, useState } from "react";
import PitchFinder from "pitchfinder";

const tuningFrequencies = {
    guitarra: {
        E6: 82,
        A: 110,
        D: 147,
        G: 196,
        B: 247,
        E1: 329.628,
    },
    ukelele: {
        G: 196,
        C: 261.63,
        E: 329.628,
        A: 440,
    },
    charango: {
        G4: 391.995,
        C5: 523.251,
        E5: 659.255,
        A4: 440,
        E4: 329.628,
    },
    ronroco: {
        D4: 293.665,
        G4: 391.995,
        B4: 493.883,
        E4: 329.628,
        B3: 246.942,
    },
};


function TuningIndicator({ frequency, targets }) {
    const { message, color } = getTuningStatus(frequency, targets);

    return (
        <p style={{ color: color }}>
            {message}
        </p>
    );
}

function getTuningStatus(frequency, targets) {
    for (const [string, targetFreq] of Object.entries(targets)) {
        if (Math.abs(frequency - targetFreq) < 1) {
            return { message: `Cuerda ${string} está afinada!`, color: "green" };
        } else if (frequency < targetFreq && frequency >= targetFreq - 10) {
            return { message: `Cuerda ${string}: Subile Papuchín!`, color: "blue" };
        } else if (frequency > targetFreq && frequency <= targetFreq + 10) {
            return { message: `Cuerda ${string}: Bajale Papuchín`, color: "red" };
        }
    }
    return { message: "Cuerda no identificada", color: "gray" };
}

const InstrumentsTuner = () => {
    const [frequency, setFrequency] = useState(null);
    const [instrument, setInstrument] = useState("guitarra"); // Instrumento seleccionado
    const [targetFrequencies, setTargetFrequencies] = useState(tuningFrequencies[instrument]);


    useEffect(() => {
        // Cambia las frecuencias objetivo cada vez que se selecciona un nuevo instrumento
        setTargetFrequencies(tuningFrequencies[instrument]);
    }, [instrument]);

    useEffect(() => {
        const getMicrophoneAccess = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 8192;

                const microphone = audioContext.createMediaStreamSource(stream);
                //Filtro de paso alto (highpass) para bloquear frecuencias por debajo de 70 hz
                const highpassFilter = audioContext.createBiquadFilter();
                highpassFilter.type = 'highpass';
                highpassFilter.frequency.setValueAtTime(70, audioContext.currentTime);

                //Filtro de paso bajo (lowpass) para bloquear frecuencias por encima de 70 hz
                const lowpassFilter = audioContext.createBiquadFilter()
                lowpassFilter.type = "lowpass"
                lowpassFilter.frequency.setValueAtTime(700, audioContext.currentTime)

                microphone.connect(highpassFilter);
                highpassFilter.connect(lowpassFilter);
                lowpassFilter.connect(analyser) //conectamos el analyser

                const detectPitch = PitchFinder.YIN({ sampleRate: audioContext.sampleRate });
                const buffer = new Float32Array(analyser.fftSize);
                let frequencySamples = [];

                const analyze = () => {
                    analyser.getFloatTimeDomainData(buffer);
                    const pitch = detectPitch(buffer);

                    if (pitch && pitch >= 70 && pitch <= 700) {
                        frequencySamples.push(pitch);
                        if (frequencySamples.length > 5) {
                            const averageFrequency = frequencySamples.reduce((sum, f) => sum + f, 0) / frequencySamples.length;
                            setFrequency(averageFrequency);
                            frequencySamples.shift();
                        }
                    }
                    requestAnimationFrame(analyze);
                };

                analyze();
            } catch (err) {
                console.error("Error accessing the microphone", err);
            }
        };

        getMicrophoneAccess();
    }, []);

    return (
        <div className="flex flex-col items-center bg-gradient-to-b from-blue-100 to-blue-300 p-8 rounded-lg shadow-lg">

            <img
                className="h-[200px] w-[200px] m-auto rounded-full shadow-black shadow-xl transition duration-500 ease-in-out transform hover:scale-105"
                src="../img/Tutuca1.jpeg" alt=""
            />

            <h1 className="text-5xl font-bold p-5 border-b-2 border-gray-300">Tutuca's Guitar Tuner</h1>


            <label
                className="p-3"
                htmlFor="instrument-select">Selecciona un instrumento:</label>
            <select
                className="w-32 p-2 bg-gray-100 text-gray-700 text-center transition-all duration-200 ease-in-out transform hover:scale-105"
                id="instrument-select"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
            >
                <option value="guitarra">Guitarra</option>
                <option value="ukelele">Ukelele</option>
                <option value="charango">Charango</option>
                <option value="ronroco">Ronroco</option>
            </select>

            <p
                className="p-3"
            >Frecuencia detectada: {frequency ? `${frequency.toFixed(2)} Hz` : 'No detectada'}</p>
            <p
                className="p-3"
            >{frequency && <TuningIndicator frequency={frequency} targets={targetFrequencies} />}</p>
            <button
                className="m-3 p-2 rounded-xl bg-lime-500 w-32 cursor-pointer hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500 border-2 border-black"
                onClick={() => window.location.reload()}
            >
                Activar Micrófono
            </button>

            <div className="border-t border-gray-700 w-2/3 my-2"></div>

            <div className=' flex justify-center gap-5 items-center mt-3 p-0'>
                <p className=' text-black'>Copyright © 2024</p>

                <p className=' text-black'>Coded by <a className='font-bold text-white' href="https://portfolio-simv3.netlify.app/" target='_blank'>Simn</a> </p>
            </div>
        </div>
    );
}


export default InstrumentsTuner
