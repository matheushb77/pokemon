import { useMemo, useState } from 'react'
import { formatName } from './PokemonCard.jsx'
import PokemonArt from './PokemonArt.jsx'
import { poolForTier, tierLabel } from '../services/power.js'

const ART_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const MAX_VISIVEIS = 24

// Numa sala onde cada um monta o próprio time, é aqui que o jogador escolhe.
//
// A lista já vem limitada à faixa de força da sala, então não dá para burlar o
// nivelamento escolhendo um Pokémon muito acima dos outros.
export default function EscolhaDoTime({ catalog, chosen, onToggle, tamanho, tier }) {
  const [busca, setBusca] = useState('')

  const disponiveis = useMemo(() => poolForTier(catalog, tier), [catalog, tier])
  const termo = busca.trim().toLowerCase()
  const resultados = useMemo(() => (
    termo
      ? disponiveis.filter((entry) => entry.name.includes(termo)).slice(0, MAX_VISIVEIS)
      : disponiveis.slice(0, MAX_VISIVEIS)
  ), [disponiveis, termo])

  const completo = chosen.length >= tamanho

  return (
    <section className="team-picker" aria-labelledby="team-picker-title">
      <h4 id="team-picker-title">Monte o seu time</h4>
      <p className="room-lobby-hint">
        {chosen.length} de {tamanho} escolhidos · faixa {tierLabel(tier)},
        {' '}{disponiveis.length} Pokémon disponíveis
      </p>

      <label className="room-field">
        <span className="sr-only">Procurar Pokémon</span>
        <input
          type="search"
          value={busca}
          placeholder="Procurar pelo nome"
          onChange={(event) => setBusca(event.target.value)}
        />
      </label>

      {resultados.length === 0 ? (
        <p className="room-lobby-hint">Nenhum Pokémon dessa faixa com esse nome.</p>
      ) : (
        <ul className="team-options">
          {resultados.map((entry) => {
            const escolhido = chosen.includes(entry.id)

            return (
              <li key={entry.id}>
                <button
                  className="team-option"
                  type="button"
                  data-chosen={escolhido}
                  aria-pressed={escolhido}
                  disabled={completo && !escolhido}
                  onClick={() => onToggle(entry.id)}
                >
                  <span className="team-option-art">
                    <PokemonArt src={`${ART_URL}/${entry.id}.png`} alt="" />
                  </span>
                  <span className="team-option-name">{formatName(entry.name)}</span>
                  {escolhido && <span className="team-option-mark">✓</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!termo && disponiveis.length > MAX_VISIVEIS && (
        <p className="room-lobby-hint">
          Mostrando {MAX_VISIVEIS} dos {disponiveis.length}. Use a busca para achar outro.
        </p>
      )}
    </section>
  )
}
