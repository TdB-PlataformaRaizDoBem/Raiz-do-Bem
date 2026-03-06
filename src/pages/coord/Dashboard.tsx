import React from "react";

const CoordDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="bg-white p-20 rounded-3xl shadow-xl border-t-8 border-darkgreen text-center">
        <h1 className="text-5xl font-bold text-orange font-fredoka mb-4 uppercase tracking-tighter">
          Dashboard [COORDENADOR]
        </h1>
      </div>
      <p className="text-gray-500 font-sans text-lg">
        Bem-vindo! Aqui você coordena seus voluntários locais.
      </p>
    </div>
  );
};

export default CoordDashboard;
