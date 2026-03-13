import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

import Container from "./Container"
import Sidebar from "./Sider"
import Header from "./Header"

import { repositorioVenda } from "../services/Vendas/vendasRepository"
import ClienteRepository from "../services/Cliente/ClienteRepository"
import repositorioMercadoria from "../services/Mercadoria/Repositorio"
import { Wind } from "lucide-react"
import Spinner from "./Spinner"

export default function Dashboard() {

  /* ---------------- REPOSITÓRIOS ---------------- */

  const vendaRepo = new repositorioVenda()
  const clienteRepo = new ClienteRepository()
  const mercRepo = new repositorioMercadoria()

  /* ---------------- STATES ---------------- */

  const [clientes, setClientes] = useState([])
  const [vendas, setVendas] = useState([])

  const [stockAtual, setStockAtual] = useState(0)
  const [ultimasVendas, setUltimasVendas] = useState([])
  const [mercadoriasRecentes, setMercadoriasRecentes] = useState([])

  const [clientesComDivida, setClientesComDivida] = useState([])

  const [totalVendas, setTotalVendas] = useState(0)
  const [vendasPagas, setVendasPagas] = useState(0)
  const [vendasDivida, setVendasDivida] = useState(0)

  const [produtosCriticos, setProdutosCriticos] = useState([])

  const [vendasMensais, setVendasMensais] = useState([])
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([])
  const [clientesMaisEndividados, setClientesMaisEndividados] = useState([])

  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  /* ---------------- CARREGAR DADOS ---------------- */
  const [carregando, setCarregando] = useState(false)

  async function carregarDados() {
     try{

      setCarregando(true)
        const cli = await clienteRepo.leitura()
        setClientes(cli)
        
        
        const merc = await mercRepo.leitura()
        
        let totalStock = 0
        merc.forEach(m => {
          totalStock += Number(m.quantidade)
        })
        
        setStockAtual(totalStock)
        
        setMercadoriasRecentes(
          merc
          .sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))
          .slice(0, 5)
        )
        
        /* AGRUPAR PRODUTOS PARA ALERTA */
        
        const agrupadas = {}

merc.forEach(item => {

  const nome = item.nome.toLowerCase()

  let categoria = ""

  if (nome.includes("rede")) categoria = "Redes"
  else if (nome.includes("corda")) categoria = "Cordas"
  else if (nome.includes("fio")) categoria = "Fios"
  else if (nome.includes("anzo")) categoria = "Anzóis"
  else if (nome.includes("bateria")) categoria = "Baterias"
  else if (nome.includes("lampada") || nome.includes("lâmpada")) categoria = "Lâmpadas"
  else if (nome.includes("filtro")) categoria = "Filtros"
  else if (nome.includes("oleo") || nome.includes("óleo")) categoria = "Óleo"
  else categoria = "Outros"

  if (!agrupadas[categoria]) {
    agrupadas[categoria] = {
      nome: categoria,
      quantidade: 0
    }
  }

  agrupadas[categoria].quantidade += Number(item.quantidade)
})
        
        const listaAgrupada = Object.values(agrupadas)
        
        const criticos = listaAgrupada.filter(p => p.quantidade < 10)
        
        setProdutosCriticos(criticos)
        
        const v = await vendaRepo.leitura()
        
        setVendas(v)
        

        processarVendas(v, cli)
      }catch{
        window.alert("Erro ao carregar os dados")
      }finally{
        setCarregando(false)
      }
    }
      /* ---------------- PROCESSAR VENDAS ---------------- */
      
      function processarVendas(listaVendas, cli) {
        
        let vendasFiltradas = listaVendas
        
        if (dataInicio && dataFim) {
          
          vendasFiltradas = listaVendas.filter(v => {
            
            const dataVenda = new Date(v.data)
            
            return (
              dataVenda >= new Date(dataInicio) &&
              dataVenda <= new Date(dataFim)
            )
          })
        }
        
        setUltimasVendas(
          vendasFiltradas.slice(-5).reverse()
        )
        
        const total = vendasFiltradas.reduce(
          (acc, v) => acc + Number(v.valor_total || 0),
          0
        )
        
        setTotalVendas(total)
        
        const pagas = vendasFiltradas
        .filter(v => v.status_p === "Pago")
        .reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
        
        setVendasPagas(pagas)
        
        const divida = vendasFiltradas
        .filter(v => v.status_p === "Em_Divida")
        .reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
        
        setVendasDivida(divida)
        
        const clientesDiv = cli.filter(c =>
          vendasFiltradas.some(
            v => v.cliente.idclientes === c.idclientes && v.status_p === "Em_Divida"
          )
        )
        
        setClientesComDivida(clientesDiv)
        
        /* VENDAS POR MES */
        
        const vendasPorMes = {}
        
        vendasFiltradas.forEach(v => {
          
          const mes = new Date(v.data).toLocaleString(
            "default",
            { month: "short", year: "numeric" }
          )
          
          vendasPorMes[mes] =
          (vendasPorMes[mes] || 0) + Number(v.valor_total || 0)
        })
        
        setVendasMensais(
          Object.entries(vendasPorMes).map(([mes, valor]) => ({
            mes,
            valor
          }))
        )
        
        /* PRODUTOS MAIS VENDIDOS */
        
        const produtosCount = {}
        
        vendasFiltradas.forEach(v => {
          v.itensVenda.forEach(i => {
            
            const nome = i.mercadorias.nome
            
            produtosCount[nome] =
            (produtosCount[nome] || 0) + i.quantidade
          })
        })
        
        setProdutosMaisVendidos(
          Object.entries(produtosCount)
          .map(([nome, qtd]) => ({ nome, qtd }))
          .sort((a, b) => b.qtd - a.qtd)
          .slice(0, 5)
        )
        
        /* CLIENTES MAIS ENDIVIDADOS */
        
        const clientesDivida = {}
        
        vendasFiltradas.forEach(v => {
          
          if (v.status_p === "Em_Divida") {
            
            const nome = v.cliente.nome
            
            clientesDivida[nome] =
            (clientesDivida[nome] || 0) + Number(v.valor_total || 0)
          }
        })
        
        setClientesMaisEndividados(
          Object.entries(clientesDivida)
          .map(([nome, valor]) => ({ nome, valor }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5)
        )
      }
      
      function aplicarFiltro() {
        processarVendas(vendas, clientes)
      }
      
      /* ---------------- KPIs ---------------- */
      
      const kpis = [
        { title: "Total Clientes", value: clientes.length, color: "text-blue-400" },
        { title: "Mercadorias em Stock", value: stockAtual, color: "text-yellow-400" },
        { title: "Total Vendas", value: totalVendas.toLocaleString() + " MT", color: "text-green-400" },
        { title: "Vendas Pagas", value: vendasPagas.toLocaleString() + " MT", color: "text-green-600" },
        { title: "Vendas em Dívida", value: vendasDivida.toLocaleString() + " MT", color: "text-red-400" },
        { title: "Clientes com Dívida", value: clientesComDivida.length, color: "text-red-500" }
      ]
      useEffect(() => {
        carregarDados()
      }, [])
      
  /* ---------------- UI ---------------- */

  return (
    <Container>
    <Sidebar />
      <Header />
 {carregando ? <Spinner /> : (
      <main className="flex-1 p-6 bg-gray-950 text-gray-100 min-h-screen">

        {/* FILTROS */}

        <div className="bg-gray-900 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-gray-800 p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-gray-800 p-2 rounded"
            />
          </div>
          <button
            onClick={aplicarFiltro}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Filtrar
          </button>

        </div>
        {/* KPIs */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
          {kpis.map((card, i) => (
            <motion.div
              key={i}
              className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-sm text-gray-400">{card.title}</h3>

              <p className={`text-2xl font-bold mt-2 ${card.color}`}>
                {card.value}
              </p>

            </motion.div>

          ))}

        </section>
        {/* GRÁFICOS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <motion.div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl">
            <h3 className="mb-4">Vendas Mensais</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="valor" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="mb-4">Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosMaisVendidos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" />
                <Tooltip />
                <Legend />

                <Bar dataKey="qtd" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

          </motion.div>
        </section>

        {/* ALERTAS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="mb-4">Mercadorias Recentes</h3>
            <ul className="space-y-2">
              {mercadoriasRecentes.map((m, i) => (
                <li key={i}>
                  {m.nome} - {m.quantidade}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl">
            <h3 className="mb-4 text-red-400">
              Alertas de Stock
            </h3>
            <ul className="space-y-2">
              {produtosCriticos.map((p, i) => (
                <li key={i} className="text-red-400">
                  ⚠ {p.nome} com estoque baixo ({p.quantidade})
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
 )}
    </Container>
  )
}