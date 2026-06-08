/* Configurações Gerais */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #f4f7f4;
    color: #333;
    line-height: 1.6;
}

header {
    background-color: #2e5a27;
    color: white;
    text-align: center;
    padding: 2rem 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

header h1 {
    margin-bottom: 0.5rem;
}

.container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

h2 {
    color: #2e5a27;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
}

/* Estilos do Quiz */
#question-number {
    font-weight: bold;
    color: #718096;
    margin-bottom: 0.5rem;
}

#question-text {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.option-btn {
    background-color: #edf2f7;
    border: 2px solid #cbd5e0;
    border-radius: 6px;
    padding: 1rem;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.option-btn:hover {
    background-color: #e2e8f0;
    border-color: #a0aec0;
}

.option-btn.correct {
    background-color: #c6f6d5;
    border-color: #38a169;
    color: #22543d;
}

.option-btn.wrong {
    background-color: #fed7d7;
    border-color: #e53e3e;
    color: #742a2a;
}

/* Estilos do Jogo */
.hidden {
    display: none !important;
}

#canvas-container {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
}

canvas {
    background-color: #8bc34a; /* Cor de grama */
    border: 4px solid #558b2f;
    border-radius: 4px;
    display: block;
}

#game-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
}

button#restart-btn {
    background-color: #2e5a27;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

button#restart-btn:hover {
    background-color: #1e3d19;
}

footer {
    text-align: center;
    padding: 1.5rem;
    background-color: #2d3748;
    color: #a0aec0;
    margin-top: 4rem;
}
