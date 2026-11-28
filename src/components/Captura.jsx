import { useEffect, useRef, useState } from 'react'
import Orbe from './Orbe.jsx'

const ABERTURA_MS = 620

// A esfera de captura girando enquanto o Pokémon é buscado na API, e abrindo
// num estouro quando ele chega.
//
// A animação não é só enfeite: ela ocupa exatamente o tempo em que o jogo
// estaria parado esperando a resposta da API. Por isso ela acompanha o estado
// de verdade em vez de rodar por um tempo fixo.
export default function Captura({ ativo, nome }) {
  const [fase, setFase] = useState(ativo ? 'girando' : 'fora')
  const estavaAtivo = useRef(ativo)

  useEffect(() => {
    if (ativo) {
      estavaAtivo.current = true
      setFase('girando')
      return undefined
    }

    // Só abre se chegou a girar: assim a animação não pisca em telas que
    // nunca passaram pela espera.
    if (!estavaAtivo.current) return undefined
    estavaAtivo.current = false
    setFase('abrindo')

    const id = window.setTimeout(() => setFase('fora'), ABERTURA_MS)
    return () => window.clearTimeout(id)
  }, [ativo])

  if (fase === 'fora') return null

  return (
    <div className="captura" data-fase={fase} role="status" aria-live="polite">
      <span className="captura-anel" aria-hidden="true" />
      <span className="captura-orbe">
        <Orbe size={96} />
      </span>
      {fase === 'abrindo' && (
        <p className="captura-texto">{nome || 'Seu Pokémon'} está pronto!</p>
      )}
    </div>
  )
}
