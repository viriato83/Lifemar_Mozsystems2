import { useEffect, useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

import Container from "../../components/Container"
import Sidebar from "../../components/Sider"
import Header from "../../components/Header"
import Spinner from "../../components/Spinner"

export default function Auditoria() {

  const [logs, setLogs] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [pesquisa, setPesquisa] = useState("")

  const token = sessionStorage.getItem("token")

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      setCarregando(true)

      const res = await axios.get(
        `https://api3.mozsystems.dev/tenant2/auditoria`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setLogs(res.data)
      console.log(res.data)

    } catch (error) {
      console.log("Erro ao carregar auditoria", error)
    } finally {
      setCarregando(false)
    }
  }

  // FILTRO
  const logsFiltrados = logs.filter(log =>
    log.usuarioId?.toString().includes(pesquisa.toLowerCase()) ||
    log.acao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.classe?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.metodo?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.detalhes?.toLowerCase().includes(pesquisa.toLowerCase())
  ).sort((a,b)=> b.id - a.id)

  // CARDS
  const totalLogs = logsFiltrados.length

  const totalDeletes = logsFiltrados.filter(
    l => l.acao?.toLowerCase().includes("delete")
  ).length

  const totalUpdates = logsFiltrados.filter(
    l => l.acao?.toLowerCase().includes("update")
  ).length

  const totalCreates = logsFiltrados.filter(
    l => l.acao?.toLowerCase().includes("create")
  ).length

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
                <h1 className="text-2xl font-bold text-gray-100">
                  Auditoria do Sistema
                </h1>

                <p className="text-gray-500">
                  Monitoramento de ações e atividades do sistema
                </p>
              </div>

              <button
                onClick={carregar}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Atualizar
              </button>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-gray-950">

              <div className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition">
                <p className="text-gray-100 font-semibold">
                  Total de Logs
                </p>

                <h2 className="text-3xl font-extrabold text-white">
                  {totalLogs}
                </h2>
              </div>

              <div className="bg-gradient-to-r from-green-400 to-green-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition">
                <p className="text-gray-100 font-semibold">
                  Registros Criados
                </p>

                <h2 className="text-3xl font-extrabold text-white">
                  {totalCreates}
                </h2>
              </div>

              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition">
                <p className="text-gray-100 font-semibold">
                  Atualizações
                </p>

                <h2 className="text-3xl font-extrabold text-white">
                  {totalUpdates}
                </h2>
              </div>

              <div className="bg-gradient-to-r from-red-400 to-red-600 shadow-xl rounded-3xl p-5 hover:shadow-2xl transition">
                <p className="text-gray-100 font-semibold">
                  Eliminações
                </p>

                <h2 className="text-3xl font-extrabold text-white">
                  {totalDeletes}
                </h2>
              </div>

            </div>

            {/* PESQUISA */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Pesquisar ação, classe, método ou detalhes..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="border bg-white border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* TABELA */}
            <div className="bg-white shadow rounded-2xl overflow-x-auto text-gray-900">

              <table className="w-full text-sm">

                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="p-4">ID</th>
                    <th className="p-4">Usuário</th>
                    <th>Ação</th>
                    <th>Classe</th>
                    <th>Método</th>
                    <th>Data</th>
                    {/* <th  className="pl-5">Detalhes</th> */}
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>

                    {logsFiltrados.map((log) => (

                      <motion.tr
                        key={log.id}
                        className="border-t hover:bg-gray-50 transition"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >

                        <td className="p-4 font-semibold">
                          {log.id}
                        </td>
                        <td className="p-4 font-semibold">
                          {log.usuarioNome
}
                        </td>

                        <td>
                          <span
                            className={`
                              px-3 py-1 rounded-full text-white text-xs font-bold
                              ${log.acao?.toLowerCase().includes("delete")
                                ? "bg-red-500"
                                : log.acao?.toLowerCase().includes("update")
                                ? "bg-yellow-500"
                                : "bg-green-600"}
                            `}
                          >
                            {log.acao}
                          </span>
                        </td>

                        <td className="font-medium">
                          {log.classe}
                        </td>

                        <td>
                          {log.metodo}
                        </td>

                        <td>
                          {new Date(log.dataHora).toLocaleString()}
                        </td>

                    

                      </motion.tr>

                    ))}

                  </AnimatePresence>
                </tbody>

              </table>

              {logsFiltrados.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum registro encontrado
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </Container>
  )
}