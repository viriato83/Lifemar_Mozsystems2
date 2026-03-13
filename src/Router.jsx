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
            <Route path="/Vendas" element={<Vendas />} />
            <Route path="/Mercadorias" element={<Mercadorias />} />
            <Route path="/Stock" element={<Stock />} />
            <Route path="/Clientes" element={<Clientes />} />
        </Routes>
    </Router>
  )
}