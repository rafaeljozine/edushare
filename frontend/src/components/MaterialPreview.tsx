import { FileText, PlayCircle } from "lucide-react";
import API_URL from "../services/api";

interface Props {
  ficheiro: string | null;
  nome: string;
}

function MaterialPreview({ ficheiro, nome }: Props) {
  if (!ficheiro) {
    return <div className="h-56 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">Sem ficheiro para pré-visualizar</div>;
  }

  const url = `${API_URL}/uploads/${ficheiro}`;
  const extensao = ficheiro.toLowerCase().split(".").pop() || "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extensao)) {
    return <img src={url} alt={`Pré-visualização de ${nome}`} className="w-full h-64 object-contain bg-slate-950 rounded-2xl" />;
  }

  if (extensao === "pdf") {
    return <iframe src={`${url}#page=1&toolbar=0&navpanes=0`} title={`Primeira página de ${nome}`} className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200" />;
  }

  if (["mp4", "webm", "ogg", "mov"].includes(extensao)) {
    return <video src={url} controls preload="metadata" className="w-full h-72 bg-slate-950 rounded-2xl"><track kind="captions" /></video>;
  }

  if (["mp3", "wav", "m4a", "aac"].includes(extensao)) {
    return <div className="h-40 bg-linear-to-br from-blue-700 to-slate-950 rounded-2xl flex flex-col items-center justify-center p-6 text-white"><PlayCircle size={42} /><audio src={url} controls preload="metadata" className="w-full mt-5" /></div>;
  }

  return (
    <div className="h-56 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-center p-6">
      <FileText size={42} className="text-blue-600" />
      <p className="font-semibold text-slate-800 mt-4">{nome}</p>
      <p className="text-sm text-slate-500 mt-2">Este formato não permite pré-visualização direta no navegador. Faça o download para abrir o ficheiro.</p>
    </div>
  );
}

export default MaterialPreview;
