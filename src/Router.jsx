import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Vendas from './services/Vendas/vendas'
import Mercadorias from './services/Mercadoria/Mercadorias'
import Stock from './services/Stock/StockPRi'
import Clientes from './services/Cliente/Clientes'

export default function BrowseRouter() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Dashboard />} />
        <Route path="/vendas" element={<Vendas />} />
<Route path="/mercadorias" element={<Mercadorias />} />
<Route path="/stock" element={<Stock />} />
<Route path="/clientes" element={<Clientes />} />
        </Routes>
    </Router>
  )
}