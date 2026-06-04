import { useEffect, useRef } from "react";

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  url: string;
}

function PdfPreview({
  url
}: Props) {

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    async function carregarPDF() {

      try {

        const pdf =
        await pdfjsLib.getDocument({
            url
        }).promise;

        const pagina =
          await pdf.getPage(1);

        const viewport =
          pagina.getViewport({
            scale: 0.5
          });

        const canvas =
          canvasRef.current;

        if (!canvas) return;

        const contexto =
          canvas.getContext("2d");

        if (!contexto) return;

        canvas.width =
          viewport.width;

        canvas.height =
          viewport.height;

        await pagina.render({
        canvas,
        canvasContext: contexto,
        viewport
        }).promise;

      } catch (erro) {

        console.log(erro);

      }

    }

    carregarPDF();

  }, [url]);

  return (

    <canvas
      ref={canvasRef}
      className="
        w-24
        h-32
        rounded-xl
        shadow-md
        object-cover
      "
    />

  );

}

export default PdfPreview;