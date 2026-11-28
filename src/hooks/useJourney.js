import { useCallback, useEffect, useRef, useState } from 'react'
import { drawOpponent, LAST_SQUARE } from '../services/journey.js'
import { powerOf } from '../services/power.js'

// O caminho do treinador em cima da batalha que já existe.
//
// Cada casa é uma luta comum contra o computador, então toda a mecânica vem do
// useBattle. Este gancho cuida do caminho: guarda o time, escolhe o rival de
// acordo com quem você escalou, captura quem você derrota e decide se avança
// ou se volta para o começo.

// Um integrante do time. A vida fica em null enquanto ele nunca lutou, que é o
// mesmo que estar com a vida cheia: quem nunca apanhou não tem o que carregar.
function novoMembro(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image || null,
    hp: null,
    maxHP: null,
    poder: powerOf(pokemon.id),
  }
}

export default function useJourney(catalog, battle) {
  // 'idle' | 'escolhendo' | 'andando' | 'perdeu' | 'venceu'
  const [status, setStatus] = useState('idle')
  const [position, setPosition] = useState(0)
  const [team, setTeam] = useState([])
  const [escalado, setEscalado] = useState(0)
  const [capturado, setCapturado] = useState(null)
  const [recorde, setRecorde] = useState(0)
  const [tentativas, setTentativas] = useState(0)

  // Cada luta ganha um número, e o resultado de cada uma só é lido uma vez.
  // Contar pela casa não funciona: ao avançar, a casa muda e a mesma vitória
  // seria contada de novo, pulando duas casas de uma vez.
  const lutaAtual = useRef(0)
  const lutaLida = useRef(-1)

  const comecarCom = useCallback((starter) => {
    setTentativas((valor) => valor + 1)
    setTeam([novoMembro(starter)])
    setEscalado(0)
    setPosition(0)
    setCapturado(null)
    setStatus('escolhendo')
  }, [])

  const sair = useCallback(() => {
    battle.leave()
    setStatus('idle')
    setPosition(0)
    setTeam([])
    setCapturado(null)
  }, [battle])

  // Escala um do time e começa a luta da casa atual.
  const lutarCom = useCallback((indice) => {
    const membro = team[indice]
    if (!membro) return

    const rival = drawOpponent(catalog, membro.poder || 300, position, team.map((m) => m.id))
    if (!rival) return

    setEscalado(indice)
    setCapturado(null)
    setStatus('andando')
    lutaAtual.current += 1
    battle.start({ id: membro.id, name: membro.name }, {
      hpInicial: membro.hp ?? undefined,
      rival,
    })
  }, [battle, catalog, position, team])

  // Lê o fim de cada luta uma única vez.
  useEffect(() => {
    if (status !== 'andando' || battle.status !== 'finished' || !battle.winner) return
    if (lutaLida.current === lutaAtual.current) return
    lutaLida.current = lutaAtual.current

    const meu = battle.player
    const rival = battle.opponent

    // A vida com que o escalado terminou segue com ele para a próxima casa.
    setTeam((atual) => atual.map((membro, indice) => (
      indice === escalado && meu
        ? { ...membro, hp: meu.currentHP, maxHP: meu.maxHP, image: membro.image || meu.image }
        : membro
    )))

    if (battle.winner !== 'player') {
      setStatus('perdeu')
      return
    }

    // Quem perdeu a luta vem junto, de vida cheia: é o prêmio que deixa seguir
    // depois de o seu time ter apanhado.
    if (rival) {
      setTeam((atual) => (
        atual.some((membro) => membro.id === rival.id) ? atual : [...atual, novoMembro(rival)]
      ))
      setCapturado({ name: rival.name, image: rival.image })
    }

    const proxima = position + 1
    setRecorde((valor) => Math.max(valor, proxima))
    setPosition(proxima)
    setStatus(proxima >= LAST_SQUARE ? 'venceu' : 'escolhendo')
  }, [battle.opponent, battle.player, battle.status, battle.winner, escalado, position, status])

  return {
    capturado,
    comecarCom,
    escalado,
    lutarCom,
    position,
    recomecar: () => { battle.leave(); setStatus('idle'); setTeam([]); setPosition(0) },
    recorde,
    sair,
    status,
    team,
    tentativas,
  }
}
