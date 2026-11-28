// A marca do site: uma esfera de captura desenhada para este projeto.
//
// Não é a bolinha vermelha e branca da Pokémon, que é um desenho registrado
// deles. Esta é outra: o corte é na diagonal em vez de na horizontal, as
// cores são as do próprio site (dourado, creme e verde escuro) e no meio tem
// um losango, não um botão redondo.
//
// A esfera é clara e os detalhes escuros, não o contrário: o cabeçalho do
// site é verde escuro, e numa primeira tentativa a metade verde sumia dentro
// dele, sobrando só uma risca dourada com cara de placa de proibido.
//
// O mesmo desenho serve de favicon (public/icone.svg) e da animação de
// captura, por isso ele aceita um estado.

// Os dois pontos onde a diagonal encosta na borda, a 45 graus do centro.
const A = 32 - 28 * Math.SQRT1_2
const B = 32 + 28 * Math.SQRT1_2

export default function Orbe({ estado = 'parado', size = 30, title }) {
  return (
    <svg
      className="orbe"
      data-estado={estado}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      <g className="orbe-corpo">
        <circle cx="32" cy="32" r="28" fill="var(--orbe-baixo, #fffaea)" />
        <path
          className="orbe-metade"
          d={`M ${A.toFixed(2)} ${A.toFixed(2)} A 28 28 0 0 1 ${B.toFixed(2)} ${B.toFixed(2)} Z`}
          fill="var(--orbe-cima, #f4cb4f)"
        />
        <line
          x1={A.toFixed(2)}
          y1={A.toFixed(2)}
          x2={B.toFixed(2)}
          y2={B.toFixed(2)}
          stroke="var(--orbe-faixa, #143b2e)"
          strokeWidth="4"
        />
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--orbe-faixa, #143b2e)" strokeWidth="4" />
      </g>

      <g className="orbe-nucleo">
        <path d="M 32 20 L 44 32 L 32 44 L 20 32 Z" fill="var(--orbe-faixa, #143b2e)" />
        <path d="M 32 26 L 38 32 L 32 38 L 26 32 Z" fill="var(--orbe-cima, #f4cb4f)" />
      </g>
    </svg>
  )
}
