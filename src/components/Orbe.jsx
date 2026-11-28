import { useId } from 'react'

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
// O volume vem de três camadas: um brilho no alto à esquerda, uma sombra
// embaixo à direita e um reflexo pequeno por cima de tudo. Sem elas a esfera
// parecia um adesivo chapado.
//
// O mesmo desenho serve de favicon (public/icone.svg) e da animação de
// captura, por isso ele aceita um estado.

// Os dois pontos onde a diagonal encosta na borda, a 45 graus do centro.
const A = 32 - 28 * Math.SQRT1_2
const B = 32 + 28 * Math.SQRT1_2

export default function Orbe({ estado = 'parado', size = 30, title }) {
  // Cada esfera na página precisa dos seus próprios gradientes, senão a
  // segunda reaproveita os da primeira.
  const uid = useId().replace(/:/g, '')

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
      <defs>
        <radialGradient id={`${uid}-cima`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="58%" stopColor="var(--orbe-cima, #f4cb4f)" />
          <stop offset="100%" stopColor="#c9a333" />
        </radialGradient>
        <radialGradient id={`${uid}-baixo`} cx="35%" cy="28%" r="88%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="var(--orbe-baixo, #fffaea)" />
          <stop offset="100%" stopColor="#dccfae" />
        </radialGradient>
        <radialGradient id={`${uid}-brilho`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="orbe-corpo">
        <circle cx="32" cy="32" r="28" fill={`url(#${uid}-baixo)`} />
        <path
          className="orbe-metade"
          d={`M ${A.toFixed(2)} ${A.toFixed(2)} A 28 28 0 0 1 ${B.toFixed(2)} ${B.toFixed(2)} Z`}
          fill={`url(#${uid}-cima)`}
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

      <ellipse
        className="orbe-reflexo"
        cx="22"
        cy="19"
        rx="11"
        ry="7"
        fill={`url(#${uid}-brilho)`}
        transform="rotate(-38 22 19)"
      />
    </svg>
  )
}
