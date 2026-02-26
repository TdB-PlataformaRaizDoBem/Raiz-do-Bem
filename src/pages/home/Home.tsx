import React from "react";
import { Header } from "../../components/layout/Header";

const Home = () => {
  return (
    <>
      <Header />
      <h1 className="font-fredoka font-bold text-darkgreen text-8xl">
        Título em Fredoka e Verde Escuro
      </h1>
      <p className="font-sans text-orange">Parágrafo em Poppins e Laranja</p>
    </>
  );
};

export default Home;
