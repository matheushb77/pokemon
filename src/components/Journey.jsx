import BattleArena from './BattleArena.jsx'
import BotaoVoltar from './BotaoVoltar.jsx'
import MapaDaJornada from './MapaDaJornada.jsx'
import PokemonArt from './PokemonArt.jsx'
import { formatName, typeLabels } from './PokemonCard.jsx'
import { LAST_SQUARE, STARTERS } from '../services/journey.js'

const ART_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const arte = (id) => `${ART_URL}/${id}.png`

function Time({ escalado, onEscalar, position, status, team }) {
  return (
    <section className="journey-team" aria-labelledby="journey-team-title">
      <h3 id="journey-team-title">
        {status === 'escolhendo'
          ? `Quem luta na casa ${position + 1}?`
          : 'Seu time'}
      </h3>
      <p className="room-lobby-hint">
        A vida não recupera entre as casas, mas todo mundo recupera um pouco ao passar de uma.
      </p>

      <ul className="journey-roster">
        {team.map((membro, indice) => {
          const nome = formatName(membro.name)
          const cheio = membro.hp === null
          const escolhido = indice === escalado && status !== 'escolhendo'

          return (
            <li key={`${membro.id}-${indice}`}>
              <button
                className="journey-member"
                type="button"
                data-chosen={escolhido}
                disabled={status !== 'escolhendo'}
                onClick={() => onEscalar(indice)}
              >
                <span className="journey-member-art">
                  <PokemonArt src={membro.image || arte(membro.id)} alt="" />
                </span>
                <span className="journey-member-name">{nome}</span>
                <span className="journey-member-hp">
                  {cheio ? 'Vida cheia' : `${membro.hp} de ${membro.maxHP} de vida`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function Journey({ battle, journey, onBack }) {
  const { capturado, escalado, position, recorde, status, team, tentativas } = journey

  return (
    <section className="journey-screen" aria-labelledby="journey-title">
      <BotaoVoltar onClick={() => { journey.sair(); onBack() }}>
        Voltar para o Modo batalha
      </BotaoVoltar>

      <header className="rooms-header">
        <p className="eyebrow">MÓDULO 02 · JORNADA</p>
        <h2 id="journey-title">Caminho do treinador</h2>
      </header>

      {(status === 'caminhando' || status === 'venceu') && (
        <MapaDaJornada
          position={position}
          recorde={recorde}
          status={status}
          vindoDe={journey.vindoDe}
        />
      )}

      {status === 'caminhando' && (
        <div className="journey-indo">
          {capturado && (
            <p className="journey-captura">
              <strong>{formatName(capturado.name)}</strong> entrou para o seu time.
            </p>
          )}
          <p className="journey-indo-texto">
            {position >= LAST_SQUARE
              ? 'Última casa vencida...'
              : `Seguindo para a casa ${position + 1} de ${LAST_SQUARE}.`}
          </p>
        </div>
      )}

      {status === 'idle' && (
        <div className="journey-card">
          <h3>Escolha com quem começar</h3>
          <p>
            Dez casas até o fim. Cada Pokémon que você derrotar entra no seu time, e
            antes de cada casa você escolhe quem luta. A vida não recupera no caminho,
            e perder devolve tudo ao começo.
          </p>
          {recorde > 0 && (
            <p className="room-lobby-hint">
              Seu recorde é a casa {recorde} de {LAST_SQUARE},
              {' '}em {tentativas} tentativa{tentativas > 1 ? 's' : ''}.
            </p>
          )}

          <ul className="journey-starters">
            {STARTERS.map((starter) => (
              <li key={starter.id}>
                <button
                  className="journey-starter"
                  type="button"
                  onClick={() => journey.comecarCom(starter)}
                >
                  <span className="journey-starter-art">
                    <PokemonArt src={arte(starter.id)} alt="" />
                  </span>
                  <span className="journey-starter-name">{formatName(starter.name)}</span>
                  <span className="type-list">
                    {starter.types.map((type) => (
                      <span className={`type-badge type-${type}`} key={type}>
                        {typeLabels[type] || type}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(status === 'escolhendo' || status === 'andando') && (
        <Time
          escalado={escalado}
          onEscalar={journey.lutarCom}
          position={position}
          status={status}
          team={team}
        />
      )}

      {status === 'andando' && (
        <BattleArena
          error={battle.error}
          log={battle.log}
          onChooseMove={battle.chooseMove}
          onLeave={journey.sair}
          onRematch={() => journey.lutarCom(escalado)}
          opponent={battle.opponent}
          player={battle.player}
          round={battle.round}
          secondsLeft={battle.secondsLeft}
          status={battle.status}
          winner={battle.winner}
          leaveLabel="Desistir da jornada"
          rematchLabel="Tentar a casa de novo"
        />
      )}

      {status === 'perdeu' && (
        <div className="journey-card" data-tone="loss">
          <h3>Você caiu na casa {position + 1}.</h3>
          <p>
            O time todo volta para o começo.
            {recorde > 0
              ? ` Seu recorde é a casa ${recorde} de ${LAST_SQUARE}.`
              : ' Ainda não dá para falar em recorde.'}
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
          <p>
            As dez casas em {tentativas} tentativa{tentativas > 1 ? 's' : ''},
            {' '}com um time de {team.length} Pokémon.
          </p>
          <button className="load-more-button" type="button" onClick={journey.recomecar}>
            Jogar de novo
          </button>
        </div>
      )}
    </section>
  )
}
