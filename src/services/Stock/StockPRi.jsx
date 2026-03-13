import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Container from "../../components/Container"
import Sidebar from "../../components/Sider"
import Header from "../../components/Header"
import repositorioStock from "./Repositorio"
import repositorioMercadoria from "../Mercadoria/Repositorio"
import Select from "react-select"
import Spinner from "../../components/Spinner"

// Classe Stock
import StockObj from "./Stock"

export default function Stock() {
  // Estados
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")
  const [pesquisa, setPesquisa] = useState("")

  // Repositórios
  const repStock = new repositorioStock()
  const repMerc = new repositorioMercadoria()

  // Dados
  const [stocks, setStocks] = useState([])
  const [mercadorias, setMercadorias] = useState([])

  // Formulário
  const [form, setForm] = useState({
    mercadoria: "",
    quantidade: "",
    tipo: "",
    data: ""
  })

  // Leitura inicial
  useEffect(() => {
    async function read() {
      setCarregando(true)
      try {
        const stockList = await repStock.leitura()
        const mercList = await repStock.buscarMercadoria()
        setStocks(stockList)
        setMercadorias(mercList)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    read()
  }, [])

  // Opções de Select
  const mercOptions = mercadorias.map(m => ({
    value: m.idmercadoria,
    label: m.nome
  }))

  // Validação
  const validarForm = () => {
   
    if (!form.quantidade) return "Informe a quantidade"
    if (!form.tipo) return "Informe o tipo"
    if (!form.data) return "Informe a data"
    return ""
  }

  // Registrar stock
  const registrarStock = async () => {
    const erro = validarForm()
    if (erro) {
      setErroForm(erro)
      return
    }
    setSalvando(true)
    setErroForm("")
    const novoStock = new StockObj(
      Number(form.quantidade),
      Number(form.quantidade), // quantidade_estoque inicial igual
      form.tipo,
      1, // usuário fixo ou trocar conforme login
      form.data,
      form.mercadoria
    )

    try {
      await repStock.cadastrar(novoStock)
      setStocks([...stocks, novoStock])
      fecharModal()
    } catch (err) {
      setErroForm("Falha ao salvar stock")
      console.error(err)
    } finally {
      setSalvando(false)
      window.location.reload()
    }
  }

  // Atualizar stock
  const actualizarStock = async () => {
    const erro = validarForm()
    if (erro) {
      setErroForm(erro)
      return
    }
    setSalvando(true)
    setErroForm("")

    const stockAtualizado = new StockObj(
      Number(form.quantidade),
      0,
      form.tipo,
      1,
      form.data,
   
    )

    try {
      await repStock.editar(idEditar, stockAtualizado)
      fecharModal()
    } catch (err) {
      setErroForm("Falha ao atualizar stock")
      console.error(err)
    } finally {
      setSalvando(false)
      window.location.reload()
    }
  }

  // Deletar stock
  const eliminarStock = async (id) => {
    if (!confirm(`Deseja eliminar o stock ${id}?`)) return
    try {
      setCarregando(true)
      await repStock.deletar(id)
      setStocks(stocks.filter(s => s.id !== id))
    } catch (err) {
      window.alert("Erro ao eliminar stock")
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  // Editar stock
  const editarStock = (stock) => {
    setModoEdicao(true)
    setModalAberto(true)
    setIdEditar(stock.idstock)
    setForm({
      quantidade: stock.quantidade,
      tipo: stock.tipo,
      data: stock.data
    })
  }

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false)
    setModoEdicao(false)
    setForm({ mercadoria: "", quantidade: "", tipo: "", data: "" })
    setErroForm("")
  }

  // Filtrar
// Filtra e ordena os stocks
const stocksFiltrados = stocks
  .filter(s => s.tipo.toLowerCase().includes(pesquisa.toLowerCase()))
  .sort((a, b) => new Date(b.data) - new Date(a.data)) // mais recente primeiro

  // Totais
  const totalStocks = stocksFiltrados.reduce((acc, s) => acc + Number(s.quantidade), 0)

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
                <h1 className="text-2xl font-bold text-gray-100">Gestão de Stock</h1>
                <p className="text-gray-500">Controle e registro do stock</p>
              </div>
              <button
                onClick={() => setModalAberto(true)}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Registrar Stock
              </button>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-gray-950">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                <p className="text-gray-100 font-semibold">Total Stocks</p>
                <h2 className="text-3xl font-extrabold text-white">{stocksFiltrados.length}</h2>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-green-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition flex flex-col justify-between">
                <p className="text-gray-100 font-semibold">Quantidade Total</p>
                <h2 className="text-3xl font-extrabold text-white">{totalStocks}</h2>
              </div>
            </div>

            {/* PESQUISA */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Pesquisar Stock..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="border bg-white border-gray-300 p-2 rounded-xl flex-1 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* TABELA */}
            <div className="bg-white shadow rounded-xl overflow-x-auto text-gray-900">
              <table className="w-full text-sm text-start">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-3">ID</th>
                    <th>QTD Entrada</th>
                    <th>QTD Disponivel</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {stocksFiltrados.map(stock => {
                    
                      return (
                        <motion.tr
                          key={stock.idstock}
                          className="border-t hover:bg-gray-50 transition"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="p-3">{stock.idstock}</td>
                          <td>{stock.quantidade_estoque}</td>
                          <td>{stock.quantidade}</td>
                          <td>{stock.tipo}</td>
                          <td>{stock.data}</td>
                          <td className="space-x-2">
                            <button
                              onClick={() => editarStock(stock)}
                              className="bg-yellow-400 px-3 py-1 rounded hover:scale-105 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarStock(stock.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105 transition"
                            >
                              Apagar
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
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
                <h2 className="text-2xl font-extrabold text-center">{modoEdicao ? "Editar Stock" : "Registrar Stock"}</h2>
                {erroForm && <p className="text-red-600 text-center">{erroForm}</p>}

                {/* FORM */}
                <div className="flex flex-wrap gap-2 mb-4">
                  
                  <input type="number" placeholder="Qtd" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} className="border p-2 rounded w-24"/>
                  <input type="tipo" value={form.tipo} placeholder="Tipo de Produto" onChange={e => setForm({ ...form, tipo: e.target.value })} className="border p-2 rounded flex-1"/>
                  <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="border p-2 rounded flex-1"/>
                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-3">
                  <button onClick={fecharModal} className="bg-gray-400 px-4 py-2 rounded hover:bg-red-800">Cancelar</button>
                  <button onClick={modoEdicao ? actualizarStock : registrarStock} disabled={salvando} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-900">
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