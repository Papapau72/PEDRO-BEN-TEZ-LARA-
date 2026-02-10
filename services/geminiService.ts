
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStudentFeedback = async (
  studentName: string,
  score: number,
  total: number,
  missedQuestions: any[]
) => {
  try {
    const prompt = `
      Actúa como un profesor de primaria motivador. 
      El alumno ${studentName} ha realizado un examen de tablas de multiplicar.
      Resultado: ${score}/${total}.
      Errores cometidos: ${missedQuestions.map(q => q.question + ' (puso ' + q.userAnswer + ', era ' + q.correctAnswer + ')').join(', ')}.
      
      Escribe un comentario breve y motivador para el alumno (máximo 3 frases). 
      Si el resultado es perfecto, felicítalo efusivamente. 
      Si hay errores, dale un pequeño truco o consejo para las tablas en las que falló.
      Idioma: Español.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "¡Buen trabajo! Sigue practicando para mejorar cada día.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Buen intento! Sigue practicando las tablas.";
  }
};
