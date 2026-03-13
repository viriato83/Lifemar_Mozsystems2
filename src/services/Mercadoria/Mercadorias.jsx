import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Container from "../../components/Container"
import Sidebar from "../../components/Sider"
import Header from "../../components/Header"
import repositorioMercadoria from "./Repositorio"
import Select from "react-select"
import Spinner from "../../components/Spinner"
import repositorioStock from "../Stock/Repositorio"
import MercadoriaObj from "./Mercadoria"

// Classe Mercadoria
export default function Mercadorias() {
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [pesquisa, setPesquisa] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")
  const [mercadorias, setMercadorias] = useState([])
  const [stocks, setStocks] = useState([])
  const [filtroStock, setFiltroStock] = useState(null)
  const [filtroData, setFiltroData] = useState({ inicio: "", fim: "" })

  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    quantidade: "",
    quantidade_est: "",
    data_entrada: "",
    valor_un: "",
    data_saida: "",
    stock: null
  })

  const repMerc = new repositorioMercadoria()
  const repStk = new repositorioStock()

  useEffect(() => {
    async function read() {
      setCarregando(true)
      try {
        const listaMerc = await repMerc.leitura()
        const listaStocks = await repStk.leitura()
        setMercadorias(listaMerc)
        setStocks(listaStocks)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    read()
  }, [])

const stockOptions = stocks
  .filter(s => Number(s.quantidade) > 0) // só stocks com quantidade > 0
  .map(s => ({
    value: s.idstock,
    label: `${s.tipo} (Qtd disponível: ${s.quantidade})`,
    quantidadeDisponivel: Number(s.quantidade) // armazenamos para validação
  }))
  const validarForm = () => {
    if (!form.nome) return "Informe o nome"

    if (!form.quantidade) return "Informe a quantidade"
    if (!form.valor_un) return "Informe o valor unitário"
    if (!form.stock) return "Selecione um stock"
    return ""
  }

  const registrarMercadoria = async () => {
  const erro = validarForm()
  if (erro) {
    setErroForm(erro)
    return
  }
  setSalvando(true)
  setErroForm("")
  
  let MercObj = new MercadoriaObj(
    form.nome,
    "Entrada",
    form.quantidade,
    form.quantidade,
    form.data_entrada,
    form.valor_un,
    null,
    1,
    form.stock
  )

  try {
    // 1️⃣ Cadastrar a mercadoria
    await repMerc.cadastrar(MercObj)
    // console.log(MercObj)

    // 2️⃣ Atualizar o stock correspondente (debitar quantidade)
    const stockSelecionado = stocks.find(s => s.idstock === form.stock)
    if (stockSelecionado) {
      const novaQtd = stockSelecionado.quantidade - Number(form.quantidade)
      await repStk.editar(stockSelecionado.idstock, {
        ...stockSelecionado,
        quantidade: novaQtd
      })
    }

    fecharModal()
  } catch (err) {
    setErroForm("Falha ao salvar mercadoria")
    console.error(err)
  } finally {
    setSalvando(false)
    window.location.reload()
  }
}

  const actualizarMercadoria = async () => {
  const erro = validarForm()
  if (erro) {
    setErroForm(erro)
    return
  }
  setSalvando(true)
  setErroForm("")

  let MercObj = new MercadoriaObj(
    form.nome,
    "Entrada",
    form.quantidade,
    form.quantidade,
    form.data_entrada,
    form.valor_un,
    null,
    1,
    form.stock
  )

  try {
    // Buscar mercadoria antiga
    const mercadoriaAntiga = mercadorias.find(m => m.idmercadoria === idEditar)

    // 1️⃣ Atualizar mercadoria
    await repMerc.editar(idEditar, MercObj)

    // 2️⃣ Ajustar stock
    if (mercadoriaAntiga.stock !== form.stock) {
      // Se mudou de stock: devolver quantidade antiga no stock antigo
      const stockAntigo = stocks.find(s => s.idstock === mercadoriaAntiga.stock)
      if (stockAntigo) {
        await repStk.editar(stockAntigo.idstock, {
          ...stockAntigo,
          quantidade: stockAntigo.quantidade + Number(mercadoriaAntiga.quantidade)
        })
      }

      // Debitar quantidade no novo stock
      const novoStock = stocks.find(s => s.idstock === form.stock)
      if (novoStock) {
        await repStk.editar(novoStock.idstock, {
          ...novoStock,
          quantidade: novoStock.quantidade - Number(form.quantidade)
        })
      }
    } else {
      // Mesma stock: ajustar diferença
      const diff = Number(form.quantidade) - Number(mercadoriaAntiga.quantidade)
      if (diff !== 0) {
        const stockAtual = stocks.find(s => s.idstock === form.stock)
        if (stockAtual) {
          await repStk.editar(stockAtual.idstock, {
            ...stockAtual,
            quantidade: stockAtual.quantidade - diff
          })
        }
      }
    }

    fecharModal()
  } catch (err) {
    setErroForm("Falha ao atualizar mercadoria")
    console.error(err)
  } finally {
    setSalvando(false)
    window.location.reload()
  }
}
  const editarMercadoria = (m) => {
    setModoEdicao(true)
    setModalAberto(true)
    setIdEditar(m.idmercadoria)
    setForm({
      nome: m.nome,
      tipo: m.tipo,
      quantidade: m.quantidade,
      quantidade_est: m.quantidade_est,
      data_entrada: m.data_entrada,
      valor_un: m.valor_un,
      data_saida: m.data_saida,
      stock: m.stock?.idstock
    })
  }

  const eliminarMercadoria = async (id) => {
    if (!confirm(`Deseja eliminar a mercadoria ${id}?`)) return
    try {
      setCarregando(true)
      await repMerc.deletar(id)
      setMercadorias(mercadorias.filter(m => m.idmercadoria !== id))
    } catch (err) {
      window.alert("Erro ao eliminar mercadoria")
      console.error(err)
    } finally {
      
      setCarregando(false)
      window.location.reload()
    }
  }

  const fecharModal = () => {
    setModalAberto(false)
    setModoEdicao(false)
    setForm({
      nome: "",
      tipo: "",
      quantidade: "",
      quantidade_est: "",
      data_entrada: "",
      valor_un: "",
      data_saida: "",
      stock: null
    })
    setErroForm("")
  }

  // Filtragem avançada
  const mercadoriasFiltradas = mercadorias.filter(m => {
    const nomeMatch = m.nome.toLowerCase().includes(pesquisa.toLowerCase())
    const stockMatch = filtroStock ? m.stock?.idstock === filtroStock : true
    const dataInicio = filtroData.inicio ? new Date(filtroData.inicio) <= new Date(m.data_entrada) : true
    const dataFim = filtroData.fim ? new Date(filtroData.fim) >= new Date(m.data_entrada) : true
     
    return nomeMatch && stockMatch && dataInicio && dataFim
  }).sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))

  // Cards resumidos
  const totalMercadorias = mercadorias.length
  const totalEstoque = mercadorias.reduce((acc, m) => acc + Number(m.quantidade || 0), 0)
  const valorTotal = mercadorias.reduce((acc, m) => acc + (Number(m.valor_un || 0) * Number(m.quantidade || 0)), 0)

  return (
    <Container>
      <Sidebar />
      <Header />
      <div className="p-6">

        {carregando ? (
          <Spinner />
        ) : (
          <>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Gestão de Mercadorias</h1>
                <p className="text-gray-500">Controle e registro das mercadorias</p>
              </div>
              <button
                onClick={() => setModalAberto(true)}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Registrar Mercadoria
              </button>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded-xl shadow flex flex-col">
                <span className="text-gray-400">Total Mercadorias</span>
                <span className="text-2xl font-bold">{totalMercadorias}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex flex-col">
                <span className="text-gray-400">Total Estoque</span>
                <span className="text-2xl font-bold">{totalEstoque}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow flex flex-col">
                <span className="text-gray-400">Valor Total</span>
                <span className="text-2xl font-bold">MZN {valorTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <input
                type="text"
                placeholder="Pesquisar mercadoria..."
                value={pesquisa}
                onChange={e => setPesquisa(e.target.value)}
                className="border bg-white border-gray-300 p-2 rounded-xl flex-1 focus:ring-2 focus:ring-blue-400 transition"
              />
              <Select
                options={stockOptions}
                placeholder="Filtrar por Stock"
                value={stockOptions.find(o => o.value === filtroStock)}
                onChange={selected => setFiltroStock(selected ? selected.value : null)}
                className="w-64 "
                isClearable
              />
              <input
                type="date"
                value={filtroData.inicio}
                onChange={e => setFiltroData({ ...filtroData, inicio: e.target.value })}
                className="border p-2 rounded-xl bg-white"
              />
              <input
                type="date"
                value={filtroData.fim}
                onChange={e => setFiltroData({ ...filtroData, fim: e.target.value })}
                className="border p-2 rounded-xl bg-white"
              />
            </div>

            {/* TABELA */}
            <div className="bg-white shadow rounded-xl overflow-x-auto text-gray-900">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-3">ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>QTD Entrada</th>
                    <th>QTD Disponivel</th>
                    <th>Valor Uni</th>
                    <th>Valor Total</th>
                    <th>Data Entrada</th>
                    <th>Data Saida</th>
                    <th>Stock</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {mercadoriasFiltradas.map(m => (
                      <motion.tr
                        key={m.idmercadoria}
                        className="border-t hover:bg-gray-50 transition"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-3">{m.idmercadoria}</td>
                        <td>{m.nome}</td>
                        <td>{m.tipo}</td>
                        <td>{m.quantidade_est}</td>
                        <td>{m.quantidade}</td>
                        <td>{m.valor_un}</td>
                        <td>{m.data_entrada}</td>
                        <td>{m.data_saida}</td>
                        <td>{(m.quantidade * m.valor_un).toLocaleString()}</td>
                        <td>{m.stock?.idstock+" : "+m.stock?.tipo}</td>
                        <td className="space-x-2">
                          <button
                            onClick={() => editarMercadoria(m)}
                            className="bg-yellow-400 px-3 py-1 rounded hover:scale-105 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarMercadoria(m.idmercadoria)}
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

        {/* MODAL */}
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
                <h2 className="text-2xl font-extrabold text-center">
                  {modoEdicao ? "Editar Mercadoria" : "Registrar Mercadoria"}
                </h2>
                {erroForm && <p className="text-red-600 text-center">{erroForm}</p>}

                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="border p-2 rounded flex-1"
                  />
                  {/* <input
                    type="text"
                    placeholder="Tipo"
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                    className="border p-2 rounded flex-1"
                  /> */}
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={form.quantidade}
                    min={1}
                    max={
                      stockOptions.find(o => o.value === form.stock)?.quantidadeDisponivel || undefined
                    }
                    onChange={e => {
                      let valor = Number(e.target.value)
                      const max = stockOptions.find(o => o.value === form.stock)?.quantidadeDisponivel
                      if (max !== undefined && valor > max) valor = max
                      if (valor < 1) valor = 1
                      setForm({ ...form, quantidade: valor })
                    }}
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Valor Unit."
                    value={form.valor_un}
                    onChange={e => setForm({ ...form, valor_un: e.target.value })}
                    className="border p-2 rounded flex-1"
                  />
                         <input
                type="date"
                value={form.data_entrada}
                placeholder="Data"
                onChange={e => setForm({ ...form, data_entrada: e.target.value })}
                className="border p-2 rounded-xl bg-white"
              />
                  <Select
                    options={stockOptions}
                    placeholder="Selecionar Stock"
                    value={stockOptions.find(o => o.value === form.stock)}
                    onChange={selected => setForm({ ...form, stock: selected.value })}
                    className="flex-1"
                  />
                  {form.stock && (
  <p className="text-gray-500 text-sm mt-1">
    Quantidade disponível: {stockOptions.find(o => o.value === form.stock)?.quantidadeDisponivel}
  </p>
)}
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={fecharModal} className="bg-gray-400 px-4 py-2 rounded hover:bg-red-800">Cancelar</button>
                  <button
                    onClick={modoEdicao ? actualizarMercadoria : registrarMercadoria}
                    disabled={salvando}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-900"
                  >
                    {salvando && <Spinner />}
                    {modoEdicao ? "Actualizar" : "Salvar"}
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