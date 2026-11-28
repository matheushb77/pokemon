import { KANTO_STARTERS } from '../data/kantoStarters.js'
import { powerOf } from './power.js'

// O caminho do treinador.
//
// Dez casas. Você começa escolhendo um dos três iniciais de Kanto e luta com
// ele. Cada Pokémon que você derrota entra no seu time, e antes de cada casa
// você escolhe qual deles vai lutar.
//
// O rival não sai de uma faixa fixa: ele é medido pelo Pokémon que você
// escalou, multiplicado por uma exigência que sobe casa a casa. Assim o
// caminho acompanha o seu time em vez de ficar fácil demais com um time forte
// ou impossível com um inicial, e nem a primeira casa é de graça.
//
// A vida não recupera de uma casa para a outra. É isso que impede atravessar o
// caminho inteiro com um Pokémon só: vencer custa vida, e em algum momento vai
// ser preciso escalar alguém que você capturou.
//
// Perder devolve tudo ao começo, inclusive o time.

export const STARTERS = KANTO_STARTERS
export const LAST_SQUARE = 10

// Quanto o rival é mais forte que o Pokémon escalado, em cada casa. Começa
// acima de 1 de propósito: a primeira casa já exige alguma coisa.
const PRIMEIRA_EXIGENCIA = 1.08
const ULTIMA_EXIGENCIA = 1.5

// De quantos candidatos o rival é sorteado, entre os de força mais próxima do
// alvo. Sorteando em vez de pegar sempre o mais próximo, duas jornadas na
// mesma casa não são idênticas.
const CANDIDATOS = 12

export function exigenciaDaCasa(position) {
  if (LAST_SQUARE === 1) return ULTIMA_EXIGENCIA
  const passo = (ULTIMA_EXIGENCIA - PRIMEIRA_EXIGENCIA) / (LAST_SQUARE - 1)
  return PRIMEIRA_EXIGENCIA + passo * position
}

// Quanto o rival desta casa deve somar de atributos, dado quem você escalou.
export function alvoDaCasa(poderEscalado, position) {
  return Math.round(poderEscalado * exigenciaDaCasa(position))
}

// Sorteia o rival entre os Pokémon de força mais perto do alvo, fora os que já
// estão no seu time.
export function drawOpponent(catalog, poderEscalado, position, idsNoTime = []) {
  const alvo = alvoDaCasa(poderEscalado, position)
  const fora = new Set(idsNoTime)

  const candidatos = catalog
    .filter((entry) => !fora.has(entry.id) && powerOf(entry.id) !== null)
    .map((entry) => ({ entry, distancia: Math.abs(powerOf(entry.id) - alvo) }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, CANDIDATOS)

  if (!candidatos.length) return null
  return candidatos[Math.floor(Math.random() * candidatos.length)].entry
}
