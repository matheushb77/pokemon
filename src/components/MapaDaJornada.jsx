import { useEffect, useRef, useState } from 'react'
import { exigenciaDaCasa, LAST_SQUARE } from '../services/journey.js'

// O mapa do caminho do treinador.
//
// Tudo aqui é desenhado à mão em SVG: a trilha, as árvores, o lago e o
// caminhante. Nada vem de jogo nenhum.
//
// A trilha é uma curva só. Os dez pontos de encontro não têm posição fixa no
// código: eles são medidos em cima da curva quando a tela monta, dividindo o
// comprimento dela em partes iguais. Assim dá para mexer no desenho da trilha
// sem ter que recalcular dez pares de coordenadas na mão.
//
// O caminhante anda pela mesma curva, com offset-path, e a distância dele é
// uma transição em CSS: quando a casa muda, ele caminha até lá sozinho.

const TRILHA = 'M 50 312 C 132 312 152 250 232 240 C 312 230 330 158 412 158 '
  + 'C 492 158 512 248 592 244 C 672 240 690 138 772 128 C 822 122 852 100 872 72'

const LARGURA = 920
const ALTURA = 370

// Árvores, moitas e pedras, espalhadas à mão para não cobrirem a trilha.
const ARVORES = [
  [100, 120, 1], [160, 70, 0.8], [250, 120, 1.1], [330, 66, 0.9], [120, 215, 0.85],
  [470, 70, 1], [560, 116, 0.9], [640, 58, 1.05], [720, 112, 0.8], [828, 170, 0.95],
  [300, 320, 0.9], [390, 290, 0.8], [520, 320, 1], [620, 300, 0.85], [710, 330, 0.95],
  [820, 280, 0.9], [200, 340, 0.8], [60, 180, 0.75], [880, 230, 0.8], [440, 344, 0.7],
]
const MOITAS = [[190, 176], [360, 212], [540, 180], [690, 196], [800, 70], [96, 268]]

function Arvore({ x, y, escala }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx="0" cy="20" rx="13" ry="4" fill="#0f2e23" opacity="0.16" />
      <rect x="-3" y="2" width="6" height="18" rx="2" fill="#6b4a2b" />
      <circle cx="0" cy="-6" r="16" fill="#2f6b43" />
      <circle cx="-7" cy="0" r="11" fill="#3a7e4f" />
      <circle cx="7" cy="-1" r="10" fill="#276038" />
      <circle cx="-3" cy="-12" r="8" fill="#49935c" />
    </g>
  )
}

export default function MapaDaJornada({ position, recorde, status }) {
  const trilhaRef = useRef(null)
  const [pontos, setPontos] = useState([])

  // Mede a trilha e reparte em dez pontos iguais.
  useEffect(() => {
    const trilha = trilhaRef.current
    if (!trilha) return

    const total = trilha.getTotalLength()
    const medidos = Array.from({ length: LAST_SQUARE }, (unused, i) => {
      const ponto = trilha.getPointAtLength((total * i) / (LAST_SQUARE - 1))
      return { x: ponto.x, y: ponto.y }
    })
    setPontos(medidos)
  }, [])

  const andadas = status === 'venceu' ? LAST_SQUARE : position
  const emJogo = status === 'escolhendo' || status === 'andando' || status === 'venceu'
  const parado = status === 'escolhendo'
  const avanco = Math.min(position, LAST_SQUARE - 1) / (LAST_SQUARE - 1)

  return (
    <div className="mapa" data-andando={!parado && status === 'andando'}>
      <svg
        className="mapa-svg"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-label={`Mapa da jornada. Você está na casa ${Math.min(position + 1, LAST_SQUARE)} de ${LAST_SQUARE}.`}
      >
        <defs>
          <linearGradient id="mapa-campo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe6cd" />
            <stop offset="100%" stopColor="#b6d9b4" />
          </linearGradient>
          <radialGradient id="mapa-lago" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#9fd0e4" />
            <stop offset="100%" stopColor="#6aa9c6" />
          </radialGradient>
        </defs>

        <rect width={LARGURA} height={ALTURA} fill="url(#mapa-campo)" />

        {/* Clareiras, só para o verde não ficar uniforme. */}
        <ellipse cx="300" cy="150" rx="150" ry="70" fill="#d7ecd4" opacity="0.55" />
        <ellipse cx="700" cy="250" rx="170" ry="80" fill="#d7ecd4" opacity="0.45" />

        <ellipse cx="156" cy="146" rx="52" ry="30" fill="url(#mapa-lago)" />
        <ellipse cx="156" cy="146" rx="52" ry="30" fill="none" stroke="#5c96b1" strokeWidth="2" />

        {/* A trilha: uma faixa larga de terra com a borda mais escura. */}
        <path d={TRILHA} fill="none" stroke="#c7a977" strokeWidth="26" strokeLinecap="round" />
        <path
          ref={trilhaRef}
          d={TRILHA}
          fill="none"
          stroke="#e0c99b"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {MOITAS.map(([x, y], i) => (
          <g key={`moita-${i}`}>
            <circle cx={x} cy={y} r="9" fill="#3f8450" />
            <circle cx={x + 7} cy={y + 3} r="7" fill="#2f6b43" />
            <circle cx={x - 7} cy={y + 3} r="6" fill="#4b9a5e" />
          </g>
        ))}

        {ARVORES.map(([x, y, escala], i) => (
          <Arvore key={`arvore-${i}`} x={x} y={y} escala={escala} />
        ))}

        {/* Os dez pontos de encontro. */}
        {pontos.map((ponto, indice) => {
          const vencida = indice < andadas
          const atual = emJogo && indice === position && status !== 'venceu'

          return (
            <g
              className="mapa-ponto"
              key={indice}
              data-done={vencida}
              data-current={atual}
              data-record={!vencida && !atual && indice < recorde}
              transform={`translate(${ponto.x} ${ponto.y})`}
            >
              <circle className="mapa-ponto-aura" r="19" />
              <circle className="mapa-ponto-base" r="13" />
              <text className="mapa-ponto-num" y="4.5" textAnchor="middle">{indice + 1}</text>
            </g>
          )
        })}

        {/* O caminhante: desenho nosso, nada de personagem de jogo. */}
        {emJogo && pontos.length > 0 && (
          <g
            className="mapa-andarilho"
            style={{ offsetPath: `path("${TRILHA}")`, offsetDistance: `${avanco * 100}%` }}
          >
            <g className="mapa-andarilho-corpo">
              <ellipse cx="0" cy="13" rx="10" ry="3.5" fill="#0f2e23" opacity="0.22" />
              <rect className="mapa-perna mapa-perna-a" x="-5" y="2" width="4" height="11" rx="2" fill="#2d4a3e" />
              <rect className="mapa-perna mapa-perna-b" x="1" y="2" width="4" height="11" rx="2" fill="#2d4a3e" />
              <rect x="-7" y="-8" width="14" height="13" rx="5" fill="#1f6b4a" />
              <path d="M -7 -5 L 7 -5 L 5 0 L -5 0 Z" fill="#f4cb4f" />
              <circle cx="0" cy="-13" r="7" fill="#f3d9b6" />
              <path d="M -8 -15 A 8 8 0 0 1 8 -15 L 8 -13 L -8 -13 Z" fill="#c74b3b" />
              <rect x="-9" y="-14" width="18" height="2.5" rx="1.2" fill="#a73a2c" />
            </g>
          </g>
        )}
      </svg>

      <p className="mapa-legenda">
        {status === 'venceu'
          ? `Caminho inteiro percorrido: ${LAST_SQUARE} de ${LAST_SQUARE}.`
          : `Casa ${Math.min(position + 1, LAST_SQUARE)} de ${LAST_SQUARE} · o rival aqui é ${Math.round((exigenciaDaCasa(position) - 1) * 100)}% mais forte que quem você escalar.`}
      </p>
    </div>
  )
}
