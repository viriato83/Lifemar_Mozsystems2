import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Container from "../../components/Container"
import Sidebar from "../../components/Sider"
import Header from "../../components/Header"
import Spinner from "../../components/Spinner"
import ClienteRepository from "./ClienteRepository"

import { repositorioVenda } from "../Vendas/vendasRepository"

export default function Clientes() {
  // Estados
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState("")
  const [pesquisa, setPesquisa] = useState("")

  // Dados
  const [clientes, setClientes] = useState([])
  const [vendas, setVendas] = useState([])
  const [historicoCliente, setHistoricoCliente] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)

  // Formulário
  const [form, setForm] = useState({
    nome: "",
    localizacao: "",
    telefone: "",
    status_p: ""
  })

  // Repositórios
  const repCliente = new ClienteRepository()
  const repVendas = new repositorioVenda()

  // Leitura inicial
  useEffect(() => {
    async function read() {
      setCarregando(true)
      try {
        const dataClientes = await repCliente.leitura()
        const dataVendas = await repVendas.leitura()
        setClientes(dataClientes)
        setVendas(dataVendas)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    read()
  }, [])

  // Validação do formulário
  const validarForm = () => {
    if (!form.nome) return "Informe o nome"
    if (!form.localizacao) return "Informe a localização"
    if (!form.telefone) return "Informe o telefone"
 
    return ""
  }

  // Registrar cliente
  const registrarCliente = async () => {
  const erro = validarForm()
  if (erro) {
    setErroForm(erro)
    return
  }

  setSalvando(true)
  setErroForm("")

  try {
    const clienteComStatus = {
      ...form,
      status_p: "Pendente"
    }

   await repCliente.cadastrar(clienteComStatus)


    fecharModal()

  } catch (err) {
    setErroForm("Falha ao cadastrar cliente")
    
    console.error(err)
  } finally {
    window.location.reload()
    setSalvando(false)
  }
}

  // Atualizar cliente
  const actualizarCliente = async () => {
    const erro = validarForm()
    if (erro) {
      setErroForm(erro)
      return
    }
    setSalvando(true)
    setErroForm("")
    try {
      await repCliente.editar(idEditar, form)
      
      fecharModal()
    } catch (err) {
      setErroForm("Falha ao atualizar cliente")
      console.error(err)
    } finally {
      window.location.reload()
      setSalvando(false)
    }
  }

  // Deletar cliente
  const eliminarCliente = async (id) => {
    if (!confirm(`Deseja eliminar o cliente ${id}?`)) return
    try {
      setCarregando(true)
      await repCliente.deletar(id)
      // setClientes(clientes.filter(c => c.id !== id))
    } catch (err) {
      window.alert("Erro ao eliminar cliente")
      console.error(err)
    } finally {

      setCarregando(false)
      window.location.reload()
    }
  }

  // Editar cliente
  const editarCliente = (cliente) => {
    setModoEdicao(true)
    setModalAberto(true)
    setIdEditar(cliente.idclientes)
    setForm({
      nome: cliente.nome,
      localizacao: cliente.localizacao,
      telefone: cliente.telefone,
      status_p: cliente.status_p
    })
  }

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false)
    setModoEdicao(false)
    setForm({ nome: "", localizacao: "", telefone: "", status_p: "" })
    setErroForm("")
    setHistoricoCliente([])
    setClienteSelecionado(null)
  }

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase())
  )

  // Ver histórico do cliente
  const verHistorico = (cliente) => {
    setClienteSelecionado(cliente)
    const historico = vendas
      .filter(v => v.cliente.idclientes === cliente.idclientes)
      .sort((a, b) => new Date(b.data) - new Date(a.data)) // mais recente primeiro
    setHistoricoCliente(historico)
    setModalAberto(true)
  }

  // Total comprado
  const totalComprado = historicoCliente.reduce((acc, v) => acc + Number(v.valor_total), 0)

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
                <h1 className="text-2xl font-bold text-gray-100">Gestão de Clientes</h1>
                <p className="text-gray-500">Controle  de Clientes</p>
              </div>
              <button
                onClick={() => setModalAberto(true)}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Registrar Cliente
              </button>
            </div>

            {/* PESQUISA */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="border bg-amber-50 border-gray-300 p-2 rounded-xl flex-1 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* TABELA DE CLIENTES */}
            <div className="bg-white shadow rounded-xl overflow-x-auto text-gray-900">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-left max-sm:text-center max-sm:gap-2">
                    <th className="p-3">ID</th>
                    <th>Nome</th>
                    <th>Localização</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th >Ações</th>
                    <th>Opções</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {clientesFiltrados.map(cliente => (
                      <motion.tr
                        key={cliente.idclientes}
                        className="border-t hover:bg-gray-50 transition text-left max-sm:text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-3">{cliente.idclientes}</td>
                        <td>{cliente.nome}</td>
                        <td>{cliente.localizacao}</td>
                        <td>{cliente.telefone?cliente.telefone:" xxxxxxxx"}</td>
                        <td className={` ${cliente.status_p === "Em_Divida" ? "text-red-500" : "text-green-600"} p-2 rounded
                          
                          ${cliente.status_p === "Pendente" ? "text-yellow-500" : ""}
                          text-center  duration-150 `}>{cliente.status_p}</td>
                        <td className="space-x-2 w-40 ">
                          <button
                            onClick={() => editarCliente(cliente)}
                            className="bg-yellow-400 px-3 py-1 rounded hover:scale-105 transition "
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarCliente(cliente.idclientes)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105 transition"
                          >
                            Apagar
                          </button>
                        
                        </td>
                        <td>  <button
                            onClick={() => verHistorico(cliente)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:scale-105 transition"
                          >
                            Histórico
                          </button></td>
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
              className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 text-gray-900 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {!clienteSelecionado ? (
                  <>
                    <h2 className="text-2xl font-extrabold text-center">{modoEdicao ? "Editar Cliente" : "Registrar Cliente"}</h2>
                    {erroForm && <p className="text-red-600 text-center">{erroForm}</p>}

                    {/* FORM */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <input type="text" placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="border p-2 rounded flex-1"/>
                      <input type="text" placeholder="Localização" value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} className="border p-2 rounded flex-1"/>
                      <input type="text" placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="border p-2 rounded flex-1"/>
                      <select value={form.status_p} onChange={e => setForm({ ...form, status_p: e.target.value })} className="border p-2 rounded flex-1 cursor-pointer">
                        <option value="">Status</option>
                        <option value="Pago">Pago</option>
                        <option value="Em_Divida">Em_Divida</option>
                      </select>
                    </div>

                    {/* BOTÕES */}
                    <div className="flex justify-end gap-3">
                      <button onClick={fecharModal} className="bg-gray-400 px-4 py-2 rounded hover:bg-red-800">Cancelar</button>
                      <button onClick={modoEdicao ? actualizarCliente : registrarCliente} disabled={salvando} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-900">
                        {salvando && <Spinner />}
                        {modoEdicao ? "Actualizar" : "Salvar"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-extrabold">{clienteSelecionado.nome} - Histórico de Compras</h2>
                      <button onClick={fecharModal} className="text-red-600 font-bold hover:scale-105 transition">Fechar</button>
                    </div>
                    <p className="font-semibold">Total Comprado: <span className="text-green-600">{totalComprado.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span></p>

                    <div className="overflow-x-auto max-h-[60vh]">
                      <table className="w-full text-sm border">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="p-2">Data</th>
                            <th>Produtos</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicoCliente.map(v => (
                            <tr key={v.idvendas} className="border-t hover:bg-gray-50 transition">
                              <td className="p-2">{v.data}</td>
                              <td>{v.itensVenda.map(i => i.mercadorias.nome).join(", ")}</td>
                              <td>{v.itensVenda.map(i => i.quantidade).join(", ")}</td>
                              <td>{Number(v.valor_total).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</td>
                              <td>{v.status_p}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  )
}