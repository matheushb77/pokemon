// Um só botão de voltar, sempre no mesmo canto de cada tela, para a pessoa
// não precisar procurar como sair de onde entrou.
export default function BotaoVoltar({ children, onClick }) {
  return (
    <button className="back-button" type="button" onClick={onClick}>
      <span className="back-arrow" aria-hidden="true">←</span>
      {children}
    </button>
  )
}
