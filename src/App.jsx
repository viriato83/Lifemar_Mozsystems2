

import { Router } from 'react-router'
import './App.css'
import Container from './components/Container'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import Sidebar from './components/Sider'
import Vendas from './services/Vendas/vendas'
import BrowseRouter from './Router'
import Login from './components/Login'
import { AuthProvider } from './context/authContext'

function App() {
    // <Container>
    //   <Sidebar />
    //   <Header />
    //   {/* <Dashboard /> */}
    //   <Vendas></Vendas>
    // </Container>

  return (
    <>
     <AuthProvider>

      <Login> <BrowseRouter></BrowseRouter>
      </Login> 
      </AuthProvider>
    
     
    </>
  )
}

export default App
