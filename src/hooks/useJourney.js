import { useCallback, useEffect, useRef, useState } from 'react'
import { drawForSquare, LAST_SQUARE } from '../services/journey.js'

// O modo tabuleiro em cima da batalha que já existe.
//
// Cada casa é uma luta comum contra o computador, então toda a mecânica vem do
// useBattle. Este gancho só cuida do caminho: sorteia o Pokémon da casa, olha
// quem venceu e decide se avança ou se volta para o começo.

export default function useJourney(catalog, battle) {
  // 'idle' | 'andando' | 'perdeu' | 'venceu'
  const [status, setStatus] = useState('idle')
  const [position, setPosition] = useState(0)
  const [recorde, setRecorde] = useState(0)
  const [tentativas, setTentativas] = useState(0)

  // Cada luta ganha um número, e o resultado de cada uma só é lido uma vez.
  // Contar pela casa não funciona: ao avançar, a casa muda e a mesma vitória
  // seria contada de novo, pulando duas casas de uma vez.
  const lutaAtual = useRef(0)
  const lutaLida = useRef(-1)

  const entrarNaCasa = useCallback((casa) => {
    const sorteado = drawForSquare(catalog, casa)
    if (!sorteado) return false
    lutaAtual.current += 1
    battle.start(sorteado)
    return true
  }, [battle, catalog])

  const comecar = useCallback(() => {
    setTentativas((valor) => valor + 1)
    setPosition(0)
    setStatus('andando')
    entrarNaCasa(0)
  }, [entrarNaCasa])

  const sair = useCallback(() => {
    battle.leave()
    setStatus('idle')
    setPosition(0)
  }, [battle])

  // Olha o fim de cada luta uma única vez.
  useEffect(() => {
    if (status !== 'andando' || battle.status !== 'finished' || !battle.winner) return

    if (lutaLida.current === lutaAtual.current) return
    lutaLida.current = lutaAtual.current

    if (battle.winner !== 'player') {
      setStatus('perdeu')
      return
    }

    const proxima = position + 1
    setRecorde((valor) => Math.max(valor, proxima))

    if (proxima >= LAST_SQUARE) {
      setStatus('venceu')
      return
    }

    setPosition(proxima)
  }, [battle.round, battle.status, battle.winner, position, status])

  const seguir = useCallback(() => {
    entrarNaCasa(position)
  }, [entrarNaCasa, position])

  const recomecar = useCallback(() => {
    comecar()
  }, [comecar])

  return {
    comecar,
    esperandoProxima: status === 'andando' && battle.status === 'finished' && battle.winner === 'player',
    position,
    recomecar,
    recorde,
    sair,
    seguir,
    status,
    tentativas,
  }
}
