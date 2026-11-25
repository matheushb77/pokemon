import BattleArena from './BattleArena.jsx'
import BotaoVoltar from './BotaoVoltar.jsx'
import { LAST_SQUARE, SQUARES, tierLabelAt } from '../services/journey.js'
import { tierById } from '../services/power.js'

function Caminho({ position, recorde, status }) {
  return (
    <ol className="journey-path">
      {SQUARES.map((casa, index) => {
        const atual = status === 'andando' && index === position
        const vencida = index < (status === 'venceu' ? LAST_SQUARE : position)

        return (
          <li
            className="journey-square"
            key={casa.number}
            data-current={atual}
            data-done={vencida}
            data-record={!vencida && !atual && index < recorde}
            aria-current={atual ? 'step' : undefined}
          >
            <span className="journey-number">{casa.number}</span>
            <span className="journey-tier">{tierById(casa.tier).label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Journey({ battle, journey, onBack }) {
  const { position, recorde, status, tentativas } = journey

  return (
    <section className="journey-screen" aria-labelledby="journey-title">
      <BotaoVoltar onClick={() => { journey.sair(); onBack() }}>
        Voltar para o Modo batalha
      </BotaoVoltar>

      <header className="rooms-header">
        <p className="eyebrow">MÓDULO 02 · JORNADA</p>
        <h2 id="journey-title">Caminho do treinador</h2>
      </header>

      <Caminho position={position} recorde={recorde} status={status} />

      {status === 'idle' && (
        <div className="journey-card">
          <h3>Dez casas até o fim</h3>
          <p>
            Em cada casa você recebe um Pokémon sorteado e enfrenta um rival da mesma
            força. Vencer avança uma casa; perder devolve você para a primeira.
          </p>
          <p className="room-lobby-hint">
            O caminho começa na faixa Leve e termina na Lendária.
            {recorde > 0 && ` Seu recorde é a casa ${recorde}, em ${tentativas} tentativa${tentativas > 1 ? 's' : ''}.`}
          </p>
          <button className="load-more-button" type="button" onClick={journey.comecar}>
            {recorde > 0 ? 'Tentar de novo' : 'Começar a jornada'}
          </button>
        </div>
      )}

      {status === 'perdeu' && (
        <div className="journey-card" data-tone="loss">
          <h3>Você caiu na casa {position + 1}.</h3>
          <p>
            A jornada volta para o começo. Seu recorde é a casa {recorde} de {LAST_SQUARE}.
          </p>
          <button className="load-more-button" type="button" onClick={journey.recomecar}>
            Começar de novo
          </button>
        </div>
      )}

      {status === 'venceu' && (
        <div className="journey-card" data-tone="win">
          <span className="champion-medal" aria-hidden="true">1º</span>
          <h3>Você chegou ao fim do caminho!</h3>
          <p>As dez casas, da faixa Leve à Lendária, em {tentativas} tentativa{tentativas > 1 ? 's' : ''}.</p>
          <button className="load-more-button" type="button" onClick={journey.recomecar}>
            Jogar de novo
          </button>
        </div>
      )}

      {status === 'andando' && (
        <>
          <p className="journey-status">
            Casa {position + 1} de {LAST_SQUARE} · faixa {tierLabelAt(position)}
          </p>

          <BattleArena
            error={battle.error}
            log={battle.log}
            onChooseMove={battle.chooseMove}
            onLeave={journey.sair}
            onRematch={journey.seguir}
            opponent={battle.opponent}
            player={battle.player}
            round={battle.round}
            secondsLeft={battle.secondsLeft}
            status={battle.status}
            winner={battle.winner}
            leaveLabel="Desistir da jornada"
            rematchLabel={`Seguir para a casa ${position + 1}`}
          />
        </>
      )}
    </section>
  )
}
