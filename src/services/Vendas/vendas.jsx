import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Container from "../../components/Container"
import Sidebar from "../../components/Sider"
import Header from "../../components/Header"
import { repositorioVenda } from "./vendasRepository"
import ClienteRepository from "../Cliente/ClienteRepository"
import repositorioMercadoria from "../Mercadoria/Repositorio"
import Select from "react-select"
import VendasObj from "../Vendas/VendasClass"
import Spinner from "../../components/Spinner"
import Clientes from "../Cliente/Cclientes"

// Spinner para carregamento


export default function Vendas() {
  // Estados do componente
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [pesquisa, setPesquisa] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")
  const [changeStatus, setchangeStatus] = useState(false)
  const [id, setID] = useState()
  const [id2, setID2] = useState()

  // Repositórios
  const repVendas = new repositorioVenda()
  const repCliente = new ClienteRepository()
  const repMerc = new repositorioMercadoria()

  // Dados
  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [mercadoria, setMercadoria] = useState([])
  const Estado = ["Pago", "Em_Divida"]

  // Formulário de vendas
  const [form, setForm] = useState({
    cliente: "",
    data: "",
    produtos: [],
    estado: ""
  })

  const [produtoTemp, setProdutoTemp] = useState({
    produtoId: null,
    quantidade: "",
    valor_uni: "",
    index: null
  })
  const usuario= sessionStorage.getItem("idusuarios");
  // Leitura inicial dos dados
  useEffect(() => {
    async function read() {
      setCarregando(true)
      try {
        const vendasList = await repVendas.leitura()
        const clientesList = await repCliente.leitura()
        const mercList = await repMerc.leitura()
        setVendas(vendasList)
        setClientes(clientesList)
        setMercadoria(mercList)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    read()
  }, [])

  // Opções para Select de mercadorias
const mercadoriaOptions = mercadoria
  .filter(m => Number(m.quantidade) > 0) // só mercadorias com stock > 0
  .map(m => ({
    value: m.idmercadoria,
    label: `${m.nome} (Qtd disponível: ${m.quantidade})`,
    preco: m.valor_uni,
    quantidadeDisponivel: Number(m.quantidade) // armazenar para validação
  }))

  // Calcula total de produtos de uma venda
  const calcularTotal = (produtos) => {
    return produtos.reduce((acc, p) => acc + p.quantidade * p.preco, 0)
  }

  // Validação do formulário
  const validarForm = () => {
    if (!form.cliente) return "Selecione um cliente"
    if (!form.data) return "Informe a data"
    if (!form.estado) return "Informe o estado do pagamento"
    if (form.produtos.length === 0) return "Adicione pelo menos um produto"
    return ""
  }

  // Adicionar ou atualizar produto temporário
  const adicionarProduto = () => {
    if (!produtoTemp.produtoId || !produtoTemp.quantidade || !produtoTemp.valor_uni) return

    const novoProduto = {
      produtoId: produtoTemp.produtoId,
      quantidade: Number(produtoTemp.quantidade),
      preco: Number(produtoTemp.valor_uni)
    }

    if (produtoTemp.index !== null) {
      const produtosAtualizados = [...form.produtos]
      produtosAtualizados[produtoTemp.index] = novoProduto
      setForm({ ...form, produtos: produtosAtualizados })
    } else {
      setForm({ ...form, produtos: [...form.produtos, novoProduto] })
    }

    setProdutoTemp({ produtoId: null, quantidade: "", valor_uni: "", index: null })
  }

  // Editar produto da lista
  const editarProduto = (produto, index) => {
    setProdutoTemp({
      produtoId: produto.produtoId,
      quantidade: produto.quantidade,
      valor_uni: produto.preco,
      index
    })
  }

  // Remover produto
  const removerProduto = (index) => {
    const produtosAtualizados = form.produtos.filter((_, i) => i !== index)
    setForm({ ...form, produtos: produtosAtualizados })
  }

  // Registrar venda
  const registrarVenda = async () => {
    const erro = validarForm()
    if (erro) {
      setErroForm(erro)
      return
    }
    setSalvando(true)
    setErroForm("")
    const mercadorias = form.produtos.map(p => ({ idmercadoria: p.produtoId }))
    const itens = form.produtos.map(p => ({
      mercadorias: { idmercadoria: p.produtoId },
      quantidade: Number(p.quantidade),
      valorUnitario: Number(p.preco)
    }))

    const novaVenda = new VendasObj(form.data, form.cliente, mercadorias, form.estado,usuario, itens)

    try {
      await repVendas.cadastrar(novaVenda)
      await repCliente.editar(form.cliente,new Clientes("","","","Em_Divida"))
      for (let p of form.produtos) {
        const prodAtual = mercadoria.find(m => m.idmercadoria === p.produtoId);
        if (prodAtual) {
            const novaQtd = prodAtual.quantidade - p.quantidade;
            await repMerc.editar3(prodAtual.idmercadoria, novaQtd);
            await repMerc.editar2(prodAtual.idmercadoria, form.data);
        }
    }

      
      fecharModal()
    } catch (err) {
      setErroForm("Falha ao salvar venda")
      console.error(err)
    } finally {
      setSalvando(false)
          // window.location.reload()
    }
  }

  // Atualizar venda
  const actualizarVenda = async () => {
    const erro = validarForm()
    if (erro) {
      setErroForm(erro)
      return
    }

    setSalvando(true)
    setErroForm("")

    const mercadorias = form.produtos.map(p => ({ idmercadoria: p.produtoId }))
    const itens = form.produtos.map(p => ({
      mercadorias: { idmercadoria: p.produtoId },
      quantidade: Number(p.quantidade),
      valor_uni: Number(p.preco)
    }))

    const vendaAtualizada = new VendasObj(form.data, form.cliente, mercadorias, form.estado, 1, itens)

     try {
    await repVendas.editar(idEditar, vendaAtualizada);

    const vendaOriginal = vendas.find(v => v.idvendas === idEditar);

    // Ajusta estoque comparando antigo x novo
    for (let pNovo of form.produtos) {
      const pAntigo = vendaOriginal.itensVenda.find(i => i.mercadorias.idmercadoria === pNovo.produtoId);
      const prod = mercadoria.find(m => m.idmercadoria === pNovo.produtoId);
      if (!prod) continue;

      if (pAntigo) {
        // Diferença entre novo e antigo
        const diff = Number(pNovo.quantidade) - Number(pAntigo.quantidade);
        const novaQtd = prod.quantidade - diff; // se diff positivo, debita; se negativo, devolve
        await repMerc.editar3(prod.idmercadoria, novaQtd);
      } else {
        // Produto novo adicionado à venda, debita do estoque
        const novaQtd = prod.quantidade - Number(pNovo.quantidade);
        await repMerc.editar3(prod.idmercadoria, novaQtd);
      }
    }

    // Caso algum produto da venda original tenha sido removido, devolver ao estoque
    for (let pAntigo of vendaOriginal.itensVenda) {
      const existe = form.produtos.find(p => p.produtoId === pAntigo.mercadorias.idmercadoria);
      if (!existe) {
        const prod = mercadoria.find(m => m.idmercadoria === pAntigo.mercadorias.idmercadoria);
        if (prod) {
          const novaQtd = prod.quantidade + Number(pAntigo.quantidade);
          await repMerc.editar3(prod.idmercadoria, novaQtd);
        }
      }
    }

    // Atualiza a lista local de vendas
    const novasVendas = vendas.map(v =>
      v.idvendas === idEditar
        ? { ...v, ...vendaAtualizada, idvendas: idEditar, itensVenda: itens, valor_total: calcularTotal(form.produtos) }
        : v
    );

    setVendas(novasVendas);
    fecharModal();
  } catch (err) {
    setErroForm("Falha ao atualizar venda");
    console.error(err);
  } finally {
    setSalvando(false);
    window.location.reload();
  }
  }

  // Excluir venda
  const eliminarVenda = async (id) => {
    if (!confirm(`Deseja eliminar a venda ${id}?`)) return
    try {
      setCarregando(true)
      await repVendas.deletar(id)
      setVendas(vendas.filter(v => v.idvendas !== id))
    } catch (err) {
      window.alert("Erro ao eliminar venda")
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  // Editar venda (preenche modal)
  const editarVenda = (venda) => {
    setModoEdicao(true)
    setModalAberto(true)
    setIdEditar(venda.idvendas)
    setForm({
      cliente: venda.cliente.idclientes,
      data: venda.data,
      estado: venda.status_p,
      produtos: (venda.itensVenda || []).map(item => ({
        produtoId: item.mercadorias.idmercadoria,
        quantidade: item.quantidade,
        preco: item.valorUnitario ?? item.valor_uni
      }))
    })
  }

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false)
    setModoEdicao(false)
    setForm({ cliente: "", data: "", produtos: [], estado: "" })
    setProdutoTemp({ produtoId: null, quantidade: "", valor_uni: "", index: null })
    setErroForm("")
  }

 // FILTROS DE DATA
const [dataInicio, setDataInicio] = useState("")
const [dataFim, setDataFim] = useState("")

const [mostrarDivida, setMostrarDivida] = useState(false);
// 3️⃣ Alterar vendasFiltradas para aplicar o filtro
const vendasFiltradas = vendas
  .filter(v =>
    (v.itensVenda?.some(i => i.mercadorias?.nome?.toLowerCase().includes(pesquisa.toLowerCase())) ||
     v.cliente?.nome?.toLowerCase().includes(pesquisa.toLowerCase()))
  )
  .filter(v => {
    const vendaDate = new Date(v.data)
    const inicio = dataInicio ? new Date(dataInicio) : null
    const fim = dataFim ? new Date(dataFim) : null
    if (inicio && vendaDate < inicio) return false
    if (fim && vendaDate > fim) return false
    return true
  })
  // ✅ Aplica filtro de dívidas se estiver ativo
  .filter(v => !mostrarDivida || v.status_p === "Em_Divida")
  .sort((a, b) => new Date(b.data) - new Date(a.data))

// Totais
const totalVendas = vendasFiltradas.reduce((acc, v) => acc + v.valor_total, 0)
const totalProdutos = vendasFiltradas.reduce((acc, v) => acc + (v.itensVenda?.reduce((a, i) => a + Number(i.quantidade), 0) || 0), 0)
const totalDividas = vendasFiltradas.filter(v => v.status_p === "Em_Divida").reduce((acc, v) => acc + v.valor_total, 0)
  // Mudar status da venda
  async function ChangeStt(params,id2) {
    try {
      setCarregando(true)
      await repVendas.editar2(params, "Pago")
      await repCliente.editar2(id2, "Pago")
      setchangeStatus(false)
    } catch {
      window.alert("Erro")
    } finally {
      setCarregando(false)
      window.location.reload()
    }
  }
  return (
    <Container>
      <Sidebar />
      <Header />
      <div className="p-6">
        {carregando ? <Spinner /> : (
          <>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Gestão de Vendas</h1>
                <p className="text-gray-500">Controle e registro das vendas</p>
              </div>
              <button
                onClick={() => setModalAberto(true)}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Registrar Venda
              </button>
            </div>

            {/* CARDS COM TOTAIS */}
          
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-gray-950">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                  <p className="text-gray-100 font-semibold">Total de Vendas</p>
                  <h2 className="text-3xl font-extrabold text-white">{vendasFiltradas.length}</h2>
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                  <p className="text-gray-100 font-semibold">Receita Total</p>
                  <h2 className="text-3xl font-extrabold text-white">{totalVendas.toFixed(2)} MT</h2>
                </div>
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                  <p className="text-gray-100 font-semibold">Quantidade Total</p>
                  <h2 className="text-3xl font-extrabold text-white">{totalProdutos} Produtos</h2>
                </div>
                <div className="bg-gradient-to-r from-red-400 to-red-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                  <p className="text-gray-100 font-semibold">Total Dívidas</p>
                  <h2 className="text-3xl font-extrabold text-white">{totalDividas.toFixed(2)} MT</h2>
                </div>
              </div>

            {/* PESQUISA */}
      
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="border  bg-white  border-gray-300 p-2 rounded-xl w-full sm:w-auto focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Data Início"
              />
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="border bg-white border-gray-300 p-2 rounded-xl w-full sm:w-auto focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Data Fim"
              />
              <input
                type="text"
                placeholder="Pesquisar cliente ou produto..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="border bg-white border-gray-300 p-2 rounded-xl flex-1 focus:ring-2 focus:ring-blue-400 transition"
              />
              {/* Checkbox para filtrar vendas em dívida */}
            <label className="flex items-center gap-2 text-gray-100">
              <input
                type="checkbox"
                checked={mostrarDivida}
                onChange={() => setMostrarDivida(!mostrarDivida)}
                className="w-4 h-4"
              />
              Apenas Vendas em Dívida
            </label>
            </div>
            {/* TABELA DE VENDAS */}
            <div className="bg-white shadow rounded-xl overflow-x-auto text-gray-900">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-3">ID</th>
                    <th>Cliente</th>
                    <th>Produtos</th>
                    <th>Qtd</th>
                    <th>Valor Unit.</th>
                    <th>Total</th>
                    <th>Data</th>
                    <th>Estado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {vendasFiltradas.map(venda => (
                      <motion.tr
                        key={venda.idvendas}
                        className="border-t hover:bg-gray-50 transition"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-3">{venda.idvendas}</td>
                        <td>{venda.cliente.nome}</td>
                        <td>{venda.itensVenda.map(i => i.mercadorias.idmercadoria +" : "+i.mercadorias.nome).join(", ")}</td>
                        <td>{venda.itensVenda.map(i => i.quantidade).join(", ")}</td>
                        <td>{venda.itensVenda.map(i => i.valorUnitario ?? i.valor_uni).join(", ")}</td>
                        <td className="text-green-600 font-bold">{venda.valor_total.toFixed(2)} MT</td>
                        <td>{venda.data}</td>
                        <td>
                          <button
                            className={`cursor-pointer ${venda.status_p === "Em_Divida" ? "bg-red-500" : "bg-green-600"} p-2 rounded w-[80px] text-center mt-2 hover:scale-105 transition-all duration-150 text-white`}
                            onClick={() => {
                              if (venda.status_p === "Em_Divida") {
                                setchangeStatus(true);
                                setID(venda.idvendas);
                                setID2(venda.cliente.idclientes);
                              }
                            }}
                          >
                            {venda.status_p}
                          </button>
                        </td>
                        <td className="space-x-2">
                          <button
                            onClick={() => editarVenda(venda)}
                            className="bg-yellow-400 px-3 py-1 rounded hover:scale-105 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarVenda(venda.idvendas)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105 transition"
                          >
                            Apagar
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL DE REGISTRO / EDIÇÃO */}
        <AnimatePresence>
          {modalAberto && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-8 text-gray-900 flex flex-col gap-6"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h2 className="text-2xl font-extrabold text-center">{modoEdicao ? "Editar Venda" : "Registrar Venda"}</h2>
                {erroForm && <p className="text-red-600 text-center">{erroForm}</p>}

                {/* FORMULÁRIO */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <select
                    value={form.cliente}
                    onChange={e => setForm({ ...form, cliente: e.target.value })}
                    className="border p-2 rounded flex-1 cursor-pointer"
                  >
                    <option value="">Cliente</option>
                    {clientes.map(m => <option key={m.idclientes} value={m.idclientes}>{m.nome}</option>)}
                  </select>

                  <select
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                    className="border p-2 rounded flex-1 cursor-pointer"
                  >
                    <option value="">Estado Pagamento</option>
                    {Estado.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>

                  <input
                    type="date"
                    value={form.data}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                    className="border p-2 rounded flex-1 cursor-pointer"
                  />
                </div>

                {/* PRODUTOS */}
                <div className="flex gap-2 mb-3">
                  <Select
                    options={mercadoriaOptions}
                    placeholder="Selecionar Mercadoria"
                    value={mercadoriaOptions.find(o => o.value === produtoTemp.produtoId)}
                    onChange={(selected) =>
                      setProdutoTemp({ ...produtoTemp, produtoId: selected.value, valor_uni: selected.preco })
                    }
                    className="flex-1 cursor-pointer"
                  />
 <input
  type="number"
  step="0.01"
  min="0.01"
  placeholder="Qtd"
  value={produtoTemp.quantidade}
  max={
    mercadoriaOptions.find(o => o.value === produtoTemp.produtoId)?.quantidadeDisponivel || undefined
  }
  onChange={e => {
    let valor = parseFloat(e.target.value)

    const max = mercadoriaOptions.find(o => o.value === produtoTemp.produtoId)?.quantidadeDisponivel

    if (max !== undefined && valor > max) valor = max
    if (valor < -1.001) valor = 0.01

    setProdutoTemp({ ...produtoTemp, quantidade: valor })
  }}
  className="border p-2 rounded w-24"
/>


                  <input type="number" placeholder="Valor Uni" value={produtoTemp.valor_uni} onChange={e => setProdutoTemp({ ...produtoTemp, valor_uni: e.target.value })} className="border p-2 rounded w-24"/>
                  <button onClick={adicionarProduto} disabled={!produtoTemp.produtoId || !produtoTemp.quantidade || !produtoTemp.valor_uni} className="bg-green-600 text-white px-3 rounded hover:opacity-70">{produtoTemp.index !== null ? "Atualizar" : "+"}</button>
                </div>

                {/* TABELA DE PRODUTOS DO FORM */}
                <div className="mb-4">
                  {form.produtos.map((p, i) => {
                    const prod = mercadoria.find(m => m.idmercadoria == p.produtoId)
                    return (
                      <div key={i} className="overflow-x-auto bg-white rounded-lg shadow mb-2">
                        <table className="min-w-full border-collapse">
                          <thead className="bg-gray-100">
                            <tr>
                              <th>Produto</th>
                              <th>Quantidade</th>
                              <th>Valor Unit.</th>
                              <th>Total</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition">
                              <td>{prod?.nome}</td>
                              <td>{p.quantidade}</td>
                              <td>{p.preco}</td>
                              <td>{(p.quantidade * p.preco).toFixed(2)}</td>
                              <td className="space-x-1">
                                <button className="bg-yellow-400 px-2 py-1 rounded" onClick={() => editarProduto(p, i)}>Editar</button>
                                <button className="bg-red-500 px-2 py-1 text-white rounded" onClick={() => removerProduto(i)}>Remover</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  })}
                </div>

                {/* BOTÕES DO MODAL */}
                <div className="flex justify-end gap-3">
                  <button onClick={fecharModal} className="bg-gray-400 px-4 py-2 rounded hover:bg-red-800">Cancelar</button>
                  <button onClick={modoEdicao ? actualizarVenda : registrarVenda} disabled={salvando} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-900">
                    {salvando && <Spinner />}
                    {modoEdicao ? "Actualizar" : "Salvar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DE LIQUIDAÇÃO */}
        <AnimatePresence>
          {changeStatus && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}>
              <motion.div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center gap-6"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <h1 className="text-xl font-extrabold text-center text-gray-800">
                  Deseja Liquidar a Dívida {id}?
                </h1>
                <div className="flex gap-4 w-full justify-center">
                  <button onClick={()=>ChangeStt(id,id2)} className="bg-gradient-to-r from-green-400 to-green-600 hover:scale-105 transform transition-all duration-200 text-white font-semibold px-6 py-2 rounded-2xl shadow-lg">
                    Sim
                  </button>
                  <button onClick={()=>setchangeStatus(false)} className="bg-gradient-to-r from-red-400 to-red-600 hover:scale-105 transform transition-all duration-200 text-white font-semibold px-6 py-2 rounded-2xl shadow-lg">
                    Não
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  )
}