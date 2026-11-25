import powerData from '../data/power.json'

// Nivelamento das lutas.
//
// A geração não serve para equilibrar: Caterpie soma 195 de atributos e Mewtwo
// soma 680, e os dois são da primeira geração. O que separa um do outro é a
// soma dos seis atributos base, que é como a própria comunidade compara força.
//
// Então o sorteio acontece dentro de uma faixa: quem está na faixa leve só
// encontra gente da faixa leve.

const totals = powerData.totals

// Os cortes saíram da distribuição real dos 1.351 Pokémon: cada faixa tem
// pelo menos uma centena deles, o bastante para o sorteio não repetir sempre
// os mesmos, e dentro de cada uma o mais forte tem no máximo o dobro dos
// atributos do mais fraco.
//
// Os nomes falam de força, não de história: Charizard cai na Elite porque
// soma 534, mesmo não sendo lendário.
export const TIERS = [
  { id: 'leve', label: 'Leve', hint: 'Até 330 de atributos', min: 0, max: 330 },
  { id: 'medio', label: 'Médio', hint: 'De 331 a 450', min: 331, max: 450 },
  { id: 'forte', label: 'Forte', hint: 'De 451 a 530', min: 451, max: 530 },
  { id: 'elite', label: 'Elite', hint: 'De 531 a 600', min: 531, max: 600 },
  { id: 'lendario', label: 'Lendário', hint: '601 ou mais', min: 601, max: Infinity },
]

export const DEFAULT_TIER = 'forte'

export function powerOf(id) {
  return totals[id] ?? null
}

export function tierById(tierId) {
  return TIERS.find((tier) => tier.id === tierId) || TIERS.find((tier) => tier.id === DEFAULT_TIER)
}

// Em qual faixa um Pokémon cai. Devolve null para quem não está na base, que
// são as formas que a API inventa e o catálogo às vezes traz.
export function tierOf(id) {
  const total = powerOf(id)
  if (total === null) return null
  return TIERS.find((tier) => total >= tier.min && total <= tier.max)?.id ?? null
}

export function tierLabel(tierId) {
  return tierById(tierId).label
}

// Os Pokémon do catálogo que cabem na faixa. Se a faixa vier vazia por algum
// motivo, devolve o catálogo inteiro em vez de travar a partida.
export function poolForTier(catalog, tierId) {
  const tier = tierById(tierId)
  const dentro = catalog.filter((entry) => {
    const total = powerOf(entry.id)
    return total !== null && total >= tier.min && total <= tier.max
  })

  return dentro.length ? dentro : catalog
}

// A faixa de um Pokémon que o jogador escolheu, para o rival sair do mesmo
// nível. Sem informação sobre ele, cai na faixa padrão.
export function tierForOpponentOf(id) {
  return tierOf(id) || DEFAULT_TIER
}
