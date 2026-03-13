import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import logo from "../logo_lifemar.png";
import { useAuth } from "../context/authContext";
export default function Login({ children }) {
  const { user, login } = useAuth();
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [errorMessage,setErrorMessage] = useState("");
  const [loading,setLoading] = useState(false);

  const [isLoggedIn,setIsLoggedIn] = useState(
    sessionStorage.getItem("ligado") === "true"
  );

  const endpointSpring = "https://api3.mozsystems.com/tenant1/login";

  const handleLogin = async () => {

    try{

      setLoading(true);

      const response = await fetch(endpointSpring,{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({
          login:username,
          senha:password
        })
      });

      if(response.status === 200){

        const data = await response.json();
            login({
          ...data,
          login: username
        });
        const {token,idusuarios,cargo} = data;

        sessionStorage.setItem("idusuarios",idusuarios);
        sessionStorage.setItem("login",username);
        sessionStorage.setItem("token",token);
        sessionStorage.setItem("cargo",cargo);
        sessionStorage.setItem("ligado","true");

        setIsLoggedIn(true);

      }else{

        setErrorMessage("Usuário ou senha incorretos");

      }

    }catch{

      setErrorMessage("Erro ao conectar ao servidor");

    }finally{

      setLoading(false);

    }

  };

  if(user||isLoggedIn){
    return <>{children}</>;
  }


  const handleKeyDown = (e)=>{
    if(e.key==="Enter"){
      handleLogin();
    }
  }

  return (

    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">

      {/* background animado */}
      <div className="absolute inset-0 opacity-30">

        <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse top-10 left-10"></div>

        <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>

      </div>


      {/* card login */}
      <motion.div
        initial={{opacity:0,scale:0.9}}
        animate={{opacity:1,scale:1}}
        transition={{duration:0.6}}
        className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8"
      >

        {/* logo */}
        <div className="text-center mb-8">

          <img src={logo} className="w-20 mx-auto mb-4"/>

          <h1 className="text-2xl font-semibold text-white">
            Lifemar System
          </h1>

          <p className="text-gray-400 text-sm">
            Gestão inteligente de negócios
          </p>

        </div>


        {/* username */}
        <div className="relative mb-5">

          <User className="absolute left-3 top-3 text-gray-400"/>

          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />

        </div>


        {/* password */}
        <div className="relative mb-6">

          <Lock className="absolute left-3 top-3 text-gray-400"/>

          <input
            type={showPassword ? "text":"password"}
            placeholder="Senha"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-900 text-white pl-10 pr-10 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="button"
            onClick={()=>setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? <EyeOff/> : <Eye/>}
          </button>

        </div>


        {/* erro */}
        {errorMessage &&

        <div className="bg-red-500/20 border border-red-500 text-red-400 text-sm p-3 rounded mb-4 text-center">

          {errorMessage}

        </div>

        }


        {/* botão */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
        >

          {loading &&
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          }

          {loading ? "Entrando..." : "Entrar"}

        </button>


        <p className="text-center text-gray-500 text-xs mt-6">

          © {new Date().getFullYear()} Lifemar • Moz Systems

        </p>

      </motion.div>

    </div>
  );
}